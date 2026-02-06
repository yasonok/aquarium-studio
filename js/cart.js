// Aquarium Studio - Cart Page Logic

document.addEventListener('DOMContentLoaded', function() {
  initializeCartPage();
});

function initializeCartPage() {
  renderCart();
  setupCheckoutForm();
  loadLineSettings();
}

function loadLineSettings() {
  // Load LINE ID from settings
  if (typeof SiteSettings !== 'undefined') {
    const settings = SiteSettings.load();
    APP_CONFIG.LINE_ID = settings.contact.lineId.replace('@', '');
    APP_CONFIG.LINE_NOTIFY_URL = `https://line.me/R/ti/p/@${settings.contact.lineId.replace('@', '')}`;
  }
}

function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;margin:0;"></span> 處理中...';
    
    // Collect form data
    const customerInfo = {
      name: document.getElementById('customer-name').value,
      phone: document.getElementById('customer-phone').value,
      address: document.getElementById('customer-address').value,
      note: document.getElementById('customer-note').value
    };
    
    // Create order
    const order = AquariumApp.createOrder(customerInfo);
    
    if (order) {
      // Show success and LINE option
      showOrderConfirmation(order);
    } else {
      AquariumApp.showToast('訂單建立失敗', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '確認訂單';
    }
  });
}

function showOrderConfirmation(order) {
  const modal = document.getElementById('order-modal');
  const content = document.getElementById('order-modal-content');
  
  if (!modal || !content) return;
  
  content.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
      <h2 style="color: #198754; margin-bottom: 15px;">訂單已成立！</h2>
      <p style="color: #6c757d; margin-bottom: 10px;">訂單編號: <strong>${order.id}</strong></p>
      <p style="margin-bottom: 20px;">總金額: <strong>$${order.total}</strong></p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: left; margin-bottom: 20px;">
        <h4 style="margin-bottom: 15px;">📋 訂單摘要</h4>
        ${(order.items || []).map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${item.price * item.quantity}</span>
          </div>
        `).join('')}
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #dee2e6;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>總計</span>
          <span>$${order.total}</span>
        </div>
      </div>
      
      <p style="color: #6c757d; font-size: 0.9rem; margin-bottom: 20px;">
        訂單通知已發送至管理員<br>
        管理員將透過 LINE 與您聯繫確認訂單
      </p>
      
      <a href="shop.html" class="btn btn-primary btn-lg" style="margin-right: 10px;">繼續購物</a>
      <button onclick="document.getElementById('order-modal').style.display='none'" class="btn btn-secondary btn-lg">關閉</button>
    </div>
  `;
  
  modal.style.display = 'flex';
}
