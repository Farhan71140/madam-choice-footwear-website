// ============================================================
// MADAM CHOICE FOOTWEAR — cart.js
// ============================================================

// ─────────────────────────────────────────
// 🛒 CART HELPERS
// ─────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ─────────────────────────────────────────
// ➕ ADD TO CART
// ─────────────────────────────────────────

function addToCart(productName, price, quantity = 1) {
  let cart = getCart();

  const existing = cart.find(item => item.name === productName);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ name: productName, price: parseFloat(price), quantity: quantity });
  }

  saveCart(cart);
  updateCart();

  // ✅ Toast instead of alert()
  showCartToast(`✅ "${productName}" ×${quantity} added to cart!`);
}

// ─────────────────────────────────────────
// ❌ REMOVE FROM CART
// ─────────────────────────────────────────

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCart();
}

// ─────────────────────────────────────────
// 🔄 UPDATE CART DISPLAY
// Updates navbar badge + any cart list on page
// ─────────────────────────────────────────

function updateCart() {
  const cart = getCart();

  // Elements that may or may not exist on the current page
  const cartItems  = document.getElementById('cartItems');
  const cartTotal  = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cartCount  = document.getElementById('cartCount');
  const cartBadge  = document.getElementById('cartBadge');

  let total = 0;
  if (cartItems) cartItems.innerHTML = '';

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const line = `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${item.name} × ${item.quantity} – ₹${itemTotal.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">✕ Remove</button>
      </li>`;

    if (cartItems) cartItems.innerHTML += line;
  });

  if (cartTotal)   cartTotal.innerText  = total.toFixed(2);
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

  // Update badge count (supports both id names)
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (cartCount) cartCount.innerText = count;
  if (cartBadge) {
    cartBadge.innerText = count;
    cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  // Save total to localStorage so pay.html can read it
  localStorage.setItem('cartTotal', total.toFixed(2));
}

// ─────────────────────────────────────────
// 💳 CHECKOUT → go to /pay
// ✅ FIXED: No longer opens old Bootstrap payment modal
// ─────────────────────────────────────────

function checkoutCart() {
  const cart = getCart();

  if (cart.length === 0) {
    showCartToast('Your cart is empty! Add items first.', 'error');
    return;
  }

  // Redirect to the proper payment page
  window.location.href = '/pay';
}

// Alias so both function names work
function startPayment() {
  checkoutCart();
}

// ─────────────────────────────────────────
// 🗑️ CLEAR CART
// ─────────────────────────────────────────

function clearCart() {
  localStorage.removeItem('cart');
  localStorage.removeItem('cartTotal');
  updateCart();
  showCartToast('Cart cleared.', 'error');
}

// ─────────────────────────────────────────
// 🍞 TOAST — replaces all alert() calls
// ─────────────────────────────────────────

function showCartToast(message, type = 'success') {
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.innerText = message;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '28px',
    left:         '50%',
    transform:    'translateX(-50%) translateY(80px)',
    background:   type === 'error' ? '#e53935' : '#1a237e',
    color:        'white',
    padding:      '13px 26px',
    borderRadius: '50px',
    fontSize:     '0.95rem',
    fontWeight:   '600',
    zIndex:       '99999',
    boxShadow:    '0 5px 20px rgba(0,0,0,0.25)',
    transition:   'transform 0.35s ease',
    whiteSpace:   'nowrap',
    maxWidth:     '90vw',
    textAlign:    'center',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─────────────────────────────────────────
// 🚀 INIT
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', updateCart);