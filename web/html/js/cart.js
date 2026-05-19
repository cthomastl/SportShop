const CART_KEY = 'sportshop_cart';

const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (_) { return []; }
  },

  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart._updateBadge();
  },

  addItem(product, qty = 1) {
    const items = Cart.get();
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: qty,
        emoji: product.imageEmoji || '🏅',
        category: product.category || '',
      });
    }
    Cart.save(items);
  },

  updateQty(productId, qty) {
    let items = Cart.get();
    if (qty <= 0) {
      items = items.filter(i => i.productId !== productId);
    } else {
      const item = items.find(i => i.productId === productId);
      if (item) item.quantity = qty;
    }
    Cart.save(items);
  },

  removeItem(productId) {
    Cart.save(Cart.get().filter(i => i.productId !== productId));
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    Cart._updateBadge();
  },

  getCount() {
    return Cart.get().reduce((sum, i) => sum + i.quantity, 0);
  },

  getTotal() {
    return Cart.get().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  _updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = Cart.getCount();
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  },
};

document.addEventListener('DOMContentLoaded', () => Cart._updateBadge());
