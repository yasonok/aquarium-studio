/**
 * Firebase Authentication & Member System
 * For Aquarium Studio
 */

// Firebase Configuration - Replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyD...", // Your Firebase API Key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Initialize Firebase
let app, auth, db, googleProvider, facebookProvider, lineProvider;

try {
  // Check if Firebase is already initialized
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Setup providers
    googleProvider = new firebase.auth.GoogleAuthProvider();
    facebookProvider = new firebase.auth.FacebookAuthProvider();
    lineProvider = new firebase.auth.LineAuthProvider();
    lineProvider.setParameters({
      scope: 'profile openid'
    });
  } else {
    app = firebase.app();
    auth = firebase.auth();
    db = firebase.firestore();
  }
} catch (e) {
  console.warn('Firebase not configured:', e.message);
  // Fallback for demo
  auth = null;
  db = null;
}

// Member System Object
const MemberSystem = {
  currentUser: null,
  
  // Check if user is logged in
  isLoggedIn: function() {
    return auth && auth.currentUser !== null;
  },
  
  // Get current user
  getCurrentUser: function() {
    return auth ? auth.currentUser : null;
  },
  
  // Google Login
  loginWithGoogle: function() {
    return new Promise((resolve, reject) => {
      if (!auth) {
        // Demo mode - simulate login
        this.simulateLogin('google');
        resolve({ provider: 'google', email: 'demo@gmail.com' });
        return;
      }
      
      auth.signInWithPopup(googleProvider)
        .then((result) => {
          this.saveUserData(result.user);
          resolve(result.user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  
  // Facebook Login
  loginWithFacebook: function() {
    return new Promise((resolve, reject) => {
      if (!auth) {
        this.simulateLogin('facebook');
        resolve({ provider: 'facebook', email: 'demo@facebook.com' });
        return;
      }
      
      auth.signInWithPopup(facebookProvider)
        .then((result) => {
          this.saveUserData(result.user);
          resolve(result.user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  
  // LINE Login
  loginWithLine: function() {
    return new Promise((resolve, reject) => {
      if (!auth) {
        this.simulateLogin('line');
        resolve({ provider: 'line', email: 'demo@line.com' });
        return;
      }
      
      auth.signInWithPopup(lineProvider)
        .then((result) => {
          this.saveUserData(result.user);
          resolve(result.user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  
  // Demo login (for testing without Firebase)
  simulateLogin: function(provider) {
    const demoUser = {
      uid: 'demo_' + Date.now(),
      email: provider + '_user@example.com',
      displayName: 'Demo ' + provider.charAt(0).toUpperCase() + provider.slice(1) + ' User',
      photoURL: '',
      providerId: provider,
      phoneNumber: '',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('memberUser', JSON.stringify(demoUser));
    this.currentUser = demoUser;
    
    // Trigger login event
    window.dispatchEvent(new CustomEvent('memberLogin', { detail: demoUser }));
  },
  
  // Logout
  logout: function() {
    if (!auth) {
      localStorage.removeItem('memberUser');
      this.currentUser = null;
      window.location.reload();
      return;
    }
    
    auth.signOut()
      .then(() => {
        localStorage.removeItem('memberUser');
        this.currentUser = null;
        window.location.reload();
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  },
  
  // Save user data to Firestore
  saveUserData: function(user) {
    if (!db) return;
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(user.uid).set(userData, { merge: true })
      .catch(error => console.error('Error saving user:', error));
  },
  
  // Get user orders
  getUserOrders: async function(userId) {
    if (!db) {
      // Return demo orders
      return this.getDemoOrders();
    }
    
    try {
      const snapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },
  
  // Demo orders for testing
  getDemoOrders: function() {
    return [
      {
        id: 'ORD001',
        date: '2026-02-05',
        items: [
          { name: '紅色孔雀魚', quantity: 2, price: 300 },
          { name: '藍色孔雀魚', quantity: 1, price: 350 }
        ],
        total: 950,
        status: '已出貨',
        customer: { name: '王小明', phone: '0912-345-678' }
      },
      {
        id: 'ORD002',
        date: '2026-01-28',
        items: [
          { name: '金色孔雀魚', quantity: 3, price: 500 }
        ],
        total: 1500,
        status: '已完成',
        customer: { name: '王小明', phone: '0912-345-678' }
      }
    ];
  },
  
  // Save order to Firestore
  saveOrder: async function(order, userId) {
    const orderData = {
      ...order,
      userId: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: '待處理'
    };
    
    if (!db) {
      // Demo mode - save to localStorage
      const orders = JSON.parse(localStorage.getItem('userOrders_' + userId) || '[]');
      orders.unshift({ ...order, id: 'ORD' + Date.now(), createdAt: new Date().toISOString() });
      localStorage.setItem('userOrders_' + userId, JSON.stringify(orders));
      return orderData;
    }
    
    try {
      const docRef = await db.collection('orders').add(orderData);
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('Error saving order:', error);
      return null;
    }
  },
  
  // Check auth state
  onAuthStateChanged: function(callback) {
    if (auth) {
      auth.onAuthStateChanged(callback);
    } else {
      // Check localStorage for demo user
      const stored = localStorage.getItem('memberUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        callback(this.currentUser);
      } else {
        callback(null);
      }
    }
  },
  
  // Initialize
  init: function() {
    // Listen for auth changes
    this.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
        window.dispatchEvent(new CustomEvent('memberLogin', { detail: user }));
      } else {
        this.currentUser = null;
        window.dispatchEvent(new CustomEvent('memberLogout'));
      }
    });
  }
};

// Make globally available
window.MemberSystem = MemberSystem;
window.firebase = firebase;
window.auth = auth;
window.db = db;
