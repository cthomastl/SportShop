document.addEventListener('DOMContentLoaded', () => {
  const items = Cart.get();

  if (items.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  // Render order preview
  const previewEl = document.getElementById('order-preview-items');
  previewEl.innerHTML = items.map(i => `
    <div class="preview-item">
      <span class="preview-item-name">
        <span>${i.emoji}</span>
        <span>${esc(i.name)}</span>
        <span class="preview-item-qty">× ${i.quantity}</span>
      </span>
      <span class="preview-item-price">$${(i.price * i.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  document.getElementById('order-preview-total').textContent = '$' + Cart.getTotal().toFixed(2);

  // Form submission
  const form = document.getElementById('checkout-form');
  const alertEl = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const customerName = document.getElementById('customer-name').value.trim();
    const customerEmail = document.getElementById('customer-email').value.trim();

    const payload = {
      customerName,
      customerEmail,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order…';
    hideAlert();

    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      Cart.clear();
      sessionStorage.setItem('lastOrderId', order.id);
      window.location.href = 'confirmation.html';
    } catch (err) {
      showAlert(err.message || 'Failed to place order. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });

  function validate() {
    let ok = true;
    const nameInput = document.getElementById('customer-name');
    const emailInput = document.getElementById('customer-email');

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, 'name-error', 'Name is required.');
      ok = false;
    } else {
      clearFieldError(nameInput, 'name-error');
    }

    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      setFieldError(emailInput, 'email-error', 'Email is required.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setFieldError(emailInput, 'email-error', 'Enter a valid email address.');
      ok = false;
    } else {
      clearFieldError(emailInput, 'email-error');
    }

    return ok;
  }

  function setFieldError(input, errId, msg) {
    input.classList.add('invalid');
    const el = document.getElementById(errId);
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function clearFieldError(input, errId) {
    input.classList.remove('invalid');
    const el = document.getElementById(errId);
    if (el) el.classList.remove('visible');
  }

  function showAlert(msg) {
    alertEl.textContent = msg;
    alertEl.classList.add('visible');
  }

  function hideAlert() {
    alertEl.classList.remove('visible');
  }

  function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
