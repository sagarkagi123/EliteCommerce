
// STATE
let cart = [];
let isLoggedIn = false;
let currentUser = null;
let allProducts = [];
let currentFilter = 'all';

const validUsers = { 'admin': 'admin123' };

const products = [
  { id: 1, name: "Smart Watch Pro", price: 1999, originalPrice: 2999, emoji: "⌚", category: "electronics", badge: "Sale" },
  { id: 2, name: "Wireless Headphones", price: 899, originalPrice: 1299, emoji: "🎧", category: "electronics", badge: "New" },
  { id: 3, name: "Running Shoes", price: 1599, originalPrice: 2199, emoji: "👟", category: "fashion", badge: "Sale" },
  { id: 4, name: "Travel Backpack", price: 499, originalPrice: 799, emoji: "🎒", category: "accessories", badge: "" },
  { id: 5, name: "Sunglasses", price: 799, originalPrice: 1199, emoji: "🕶️", category: "accessories", badge: "New" },
  { id: 6, name: "Phone Case", price: 299, originalPrice: 499, emoji: "📱", category: "accessories", badge: "" },
  { id: 7, name: "Laptop Stand", price: 699, originalPrice: 999, emoji: "💻", category: "electronics", badge: "Sale" },
  { id: 8, name: "Water Bottle", price: 399, originalPrice: 599, emoji: "💧", category: "accessories", badge: "" },
  { id: 9, name: "Gaming Mouse", price: 1299, originalPrice: 1799, emoji: "🖱️", category: "electronics", badge: "New" }
];

allProducts = [...products];

// HELPERS
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageName).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.dataset.page;
    link.classList.toggle('active', target === pageName);
  });

  document.getElementById("navMenu").classList.remove("show");

  if (pageName === 'cart') renderCart();
}

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartBadge').textContent = total;
}

function openLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

function updateProductButtons() {
  document.querySelectorAll('.product-card button').forEach(button => {
    if (!isLoggedIn) {
      button.disabled = true;
      button.textContent = 'Login to Shop';
    } else {
      button.disabled = false;
      button.textContent = 'Add to Cart';
    }
  });
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showToast('Please fill in all fields');
    return;
  }

  if (validUsers[username] && validUsers[username] === password) {
    isLoggedIn = true;
    currentUser = username;
    document.getElementById('userName').textContent = username;
    document.getElementById('userNav').style.display = 'inline';
    document.getElementById('loginLink').style.display = 'none';
    closeLoginModal();
    updateProductButtons();
    showToast(`Welcome back, ${username}!`);
  } else {
    showToast('Invalid credentials!');
  }
}

function logout() {
  cart = [];
  isLoggedIn = false;
  currentUser = null;
  document.getElementById('userNav').style.display = 'none';
  document.getElementById('loginLink').style.display = 'inline';
  updateCartBadge();
  updateProductButtons();
  if (document.getElementById('cart').classList.contains('active')) renderCart();
  showToast('Logged out successfully');
}

function addToCart(productId) {
  if (!isLoggedIn) {
    openLoginModal();
    return;
  }

  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartBadge();
  showToast(`${product.name} added!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartBadge();
  renderCart();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><h3>Your cart is empty</h3><p>Start shopping!</p></div>';
    cartTotal.innerHTML = '';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span style="font-size: 50px;">${item.emoji}</span>
        <div>
          <h3>${item.name}</h3>
          <p style="font-size: 14px; color:var(--text-secondary);">₹${item.price} each</p>
        </div>
      </div>
      <div class="cart-controls">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <div style="text-align: right;">
        <p style="color: var(--primary); font-weight: bold; font-size: 1.3em;">₹${item.price * item.quantity}</p>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

  cartTotal.innerHTML = `
    <div class="cart-total">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₹${subtotal}</span>
      </div>
      <div class="total-row" style="color: var(--success);">
        <span>You Save:</span>
        <span>₹${savings}</span>
      </div>
      <div class="total-final">
        <span>Total:</span>
        <span>₹${subtotal}</span>
      </div>
      <button class="btn" onclick="checkout()" style="margin-top: 20px; width: 100%;">Proceed to Checkout</button>
    </div>
  `;
}

function checkout() {
  if (!isLoggedIn) {
    showToast('Please login!');
    openLoginModal();
    return;
  }
  showToast(`Thank you ${currentUser}! Order placed successfully!`);
  cart = [];
  updateCartBadge();
  showPage('home');
}

function renderProducts(productsToRender) {
  const productList = document.getElementById('productList');
  productList.innerHTML = productsToRender.map(p => `
    <div class="product-card">
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      <span class="product-emoji">${p.emoji}</span>
      <h3>${p.name}</h3>
      <div class="product-price">
        ₹${p.price}
        <span class="original-price">₹${p.originalPrice}</span>
      </div>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    </div>
  `).join('');
  updateProductButtons();
}

function filterProducts(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  const filtered = category === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === category);
  
  renderProducts(filtered);
}

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  if (!query) {
    renderProducts(allProducts);
    return;
  }

  const results = allProducts.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query)
  );

  renderProducts(results);
  showToast(`Found ${results.length} products`);
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  document.getElementById('logoBtn').addEventListener('click', () => showPage('home'));
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('show');
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const page = link.dataset.page;
      if (page) showPage(page);
    });
  });
  
  // Login/Logout
  document.getElementById('loginLink').addEventListener('click', openLoginModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeLoginModal);
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutLink').addEventListener('click', logout);
  
  // Shop button
  document.getElementById('shopNowBtn').addEventListener('click', () => showPage('products'));
  
  // Search
  document.getElementById('searchBtn').addEventListener('click', searchProducts);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProducts();
  });
  
  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterProducts(btn.dataset.filter);
    });
  });
  
  // Modal close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('loginModal')) closeLoginModal();
  });
  
  // Initialize
  renderProducts(allProducts);
  updateCartBadge();
});
