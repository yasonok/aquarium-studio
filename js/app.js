// Aquarium Studio - Main Application Logic

// App Configuration
const APP_CONFIG = {
  APP_NAME: 'Aquarium Studio',
  LINE_ID: 'tsAGZrm9vt',
  LINE_NOTIFY_URL: 'https://line.me/R/ti/p/@tsAGZrm9vt',
  DEFAULT_CURRENCY: 'TWD',
  STORAGE_KEYS: {
    PRODUCTS: 'aquarium_products',
    CART: 'aquarium_cart',
    ORDERS: 'aquarium_orders',
    ADMIN_PASSWORD: 'aquarium_admin_pwd'
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Load products from storage or use default
  loadProducts();
  
  // Setup mobile menu toggle
  setupMobileMenu();
  
  // Render products on shop page
  if (document.getElementById('product-grid')) {
    renderProducts();
  }
  
  // Update cart badge
  updateCartBadge();
}

// Product Management
function loadProducts() {
  const storedProducts = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
  if (!storedProducts) {
    // Load from products.json
    fetch('products.json')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      })
      .catch(() => {
        // Use default products if file not found
        const defaultProducts = getDefaultProducts();
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      });
  }
}

function getProducts() {
  const products = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
  return products ? JSON.parse(products) : [];
}

function saveProducts(products) {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return products;
}

function getDefaultProducts() {
  return [
    {
      id: 1,
      name: '全紅孔雀魚',
      price: 200,
      stock: 15,
      category: '紅色系',
      description: '經典熱門品種，顏色鮮豔，繁殖穩定，適合新手',
      status: 'available',
      image: 'images/products/default-guppy.svg',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: '黑禮服孔雀魚',
      price: 150,
      stock: 8,
      category: '黑色系',
      description: '優雅黑色禮服，經典款式，適應力強',
      status: 'available',
      image: 'images/products/default-guppy.svg',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: '馬賽克孔雀魚',
      price: 180,
      stock: 12,
      category: '特殊系',
      description: '色彩繽紛如馬賽克，觀賞性極高',
      status: 'available',
      image: 'images/products/default-guppy.svg',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: '蛇王孔雀魚',
      price: 300,
      stock: 5,
      category: '稀有系',
      description: '蛇紋圖案獨特美觀，稀有品種',
      status: 'available',
      image: 'images/products/default-guppy.svg',
      created_at: new Date().toISOString()
    }
  ];
}

// Render Products
function renderProducts(filter = 'all', sortBy = 'default') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  let products = getProducts();
  
  // Filter products
  if (filter !== 'all') {
    products = products.filter(p => p.category === filter);
  }
  
  // Sort products
  switch(sortBy) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🐟</div>
        <h3>沒有找到商品</h3>
        <p>請嘗試其他篩選條件</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
  const stockClass = product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : '';
  const stockText = product.stock <= 0 ? '缺貨中' : product.stock <= 5 ? `僅剩 ${product.stock} 隻` : `庫存 ${product.stock} 隻`;
  const buyDisabled = product.stock <= 0 ? 'disabled' : '';
  const buyText = product.stock <= 0 ? '缺貨' : '立即購買';
  
  // Video button if video exists
  const videoBtn = product.video ? `
    <button class="btn btn-outline btn-sm" onclick="viewProductVideo('${escapeHtml(product.video)}', '${escapeHtml(product.name)}')" style="margin-top: 8px;">
      🎬 觀看影片
    </button>
  ` : '';

  return `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.image || 'images/products/default-guppy.svg'}" 
           alt="${product.name}" 
           class="product-image"
           onerror="this.src='images/products/default-guppy.svg'">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price}</span>
          <span class="product-stock ${stockClass}">${stockText}</span>
        </div>
        <button class="btn btn-primary btn-block" 
                onclick="quickBuy(${product.id})" 
                ${buyDisabled}>
          ${buyText}
        </button>
        ${videoBtn}
      </div>
    </div>
  `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// View product video (supports both video files and YouTube/Vimeo URLs)
function viewProductVideo(videoData, productName) {
  let embedContent = '';
  let videoLink = '';
  
  // Check if it's a base64 video file
  if (videoData.startsWith('data:video/')) {
    embedContent = `<video src="${videoData}" controls style="width: 100%; height: 450px; background: #000;"></video>`;
    videoLink = videoData;
  } 
  // Check if it's a YouTube URL
  else if (videoData.includes('youtube.com') || videoData.includes('youtu.be')) {
    const ytMatch = videoData.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (ytMatch && ytMatch[1]) {
      embedContent = `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="width: 100%; height: 450px; border: none;" allowfullscreen></iframe>`;
      videoLink = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
    }
  }
  // Vimeo
  else if (videoData.includes('vimeo.com')) {
    const vimeoMatch = videoData.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      embedContent = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" style="width: 100%; height: 450px; border: none;" allowfullscreen></iframe>`;
      videoLink = videoData;
    }
  }
  // Otherwise assume it's a direct video URL
  else {
    embedContent = `<video src="${videoData}" controls style="width: 100%; height: 450px; background: #000;"></video>`;
    videoLink = videoData;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <h3>🎬 ${productName}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div style="padding: 0;">
        ${embedContent}
      </div>
      ${videoLink ? `
      <div style="padding: 15px;">
        <a href="${videoLink}" target="_blank" class="btn btn-outline">🔗 在新視窗打開</a>
      </div>
      ` : ''}
    </div>
  `;
  document.body.appendChild(modal);
}

// Quick Buy
function quickBuy(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product || product.stock <= 0) {
    showToast('商品已缺貨，無法購買', 'error');
    return;
  }
  
  addToCart(product.id, 1);
  window.location.href = 'cart.html';
}

// Cart Functions
function getCart() {
  const cart = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CART);
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity = 1) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    showToast('找不到商品', 'error');
    return;
  }
  
  let cart = getCart();
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      maxStock: product.stock
    });
  }
  
  saveCart(cart);
  showToast(`已將 ${product.name} 加入購物車`, 'success');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function updateCartQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (item.quantity > item.maxStock) {
      showToast(`庫存不足，最高可購買 ${item.maxStock} 隻`, 'warning');
      item.quantity = item.maxStock;
    }
  }
  
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Render Cart
function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  if (!cartContainer) return;

  const cart = getCart();
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>購物車是空的</h3>
        <p>去逛逛我們的產品吧！</p>
        <a href="shop.html" class="btn btn-primary" style="margin-top: 20px;">開始購物</a>
      </div>
    `;
    document.getElementById('cart-summary').style.display = 'none';
    return;
  }

  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image">
        <img src="${item.image || 'images/products/default-guppy.svg'}" 
             alt="${item.name}"
             onerror="this.src='images/products/default-guppy.svg'">
        <div>
          <h4>${item.name}</h4>
          <span class="product-price">$${item.price}</span>
        </div>
      </div>
      <div class="quantity-control">
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">−</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">＋</button>
      </div>
      <div class="item-total">$${item.price * item.quantity}</div>
      <div class="item-stock">庫存: ${item.maxStock}</div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');

  // Update summary
  document.getElementById('cart-total').textContent = `$${getCartTotal()}`;
  document.getElementById('cart-summary').style.display = 'block';
}

// Order Functions
function createOrder(customerInfo) {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('購物車是空的', 'error');
    return null;
  }

  // Calculate total with shipping fee
  const subtotal = getCartTotal();
  const shippingFee = customerInfo.shippingFee || 0;
  const total = subtotal + shippingFee;

  const order = {
    id: 'ORD' + Date.now(),
    items: [...cart],
    subtotal: subtotal,
    shippingFee: shippingFee,
    total: total,
    customer: customerInfo,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  // Save order
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

  // Send LINE notification
  sendLineNotification(order);

  // Clear cart
  clearCart();

  return order;
}

function getOrders() {
  const orders = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
}

function sendLineNotification(order) {
  // Get LINE ID from settings or use default
  let lineId = APP_CONFIG.LINE_ID;
  if (typeof SiteSettings !== 'undefined') {
    const settings = SiteSettings.load();
    lineId = settings.contact.lineId.replace('@', '');
  }
  
  const shippingNames = {
    'blackcat-prepay': '黑貓宅急便 (先付款)',
    'blackcat-cod': '黑貓宅急便 (貨到付款)',
    'post-office': '郵局/大榮物流'
  };
  
  const paymentNames = {
    'linepay': 'LINE Pay',
    'atm': '銀行轉帳',
    'cod': '貨到付款',
    'credit': '信用卡'
  };
  
  const message = `
🐟 Aquarium Studio 新訂單通知

📋 訂單編號: ${order.id}
📅 時間: ${new Date(order.created_at).toLocaleString('zh-TW')}

👤 顧客資料:
- 姓名: ${order.customer.name}
- 電話: ${order.customer.phone}
- 地址: ${order.customer.address}
- LINE ID: ${order.customer.lineId || '未提供'}

🚚 配送方式: ${shippingNames[order.customer.shippingMethod] || '未選擇'}
💳 付款方式: ${paymentNames[order.customer.paymentMethod] || '未選擇'}

📦 訂單內容:
${order.items.map(item => `- ${item.name} x ${item.quantity} = $${item.price * item.quantity}`).join('\n')}

💰 費用:
- 商品小計: $${order.subtotal || order.total - (order.shippingFee || 0)}
- 運費: $${order.shippingFee || 0}
- 總金額: $${order.total}

📝 備註: ${order.customer.note || '無'}

狀態: 待處理
`;

  // Encode message for LINE
  const encodedMessage = encodeURIComponent(message);
  
  // Store notification for admin
  const notifications = JSON.parse(localStorage.getItem('line_notifications') || '[]');
  notifications.push({ orderId: order.id, message: message, created_at: new Date().toISOString() });
  localStorage.setItem('line_notifications', JSON.stringify(notifications));
  
  // Open LINE with order message
  const lineUrl = `https://line.me/R/ti/p/@${lineId}?${encodedMessage}`;
  showToast('訂單已成立！正在開啟 LINE...', 'success');
  
  // Open LINE in new window/tab
  setTimeout(() => {
    window.open(lineUrl, '_blank');
  }, 500);
}

// Mobile Menu
function setupMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  const container = document.createElement('div');
  container.className = 'toast-container';
  container.innerHTML = `
    <div class="toast ${type}">
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(container);
  
  setTimeout(() => {
    container.remove();
  }, 3000);
}

// Export functions for use in other scripts
window.AquariumApp = {
  getProducts,
  addToCart,
  removeFromCart,
  getCart,
  getCartTotal,
  getCartCount,
  createOrder,
  getOrders,
  showToast,
  renderProducts,
  APP_CONFIG
};
