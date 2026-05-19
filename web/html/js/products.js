document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('product-grid');
  const filtersEl = document.getElementById('category-filters');

  let allProducts = [];
  let activeCategory = 'All';

  grid.innerHTML = '<div class="loading">Loading products…</div>';

  try {
    allProducts = await apiFetch('/products');
  } catch (e) {
    grid.innerHTML = `<div class="loading">Failed to load products: ${e.message}</div>`;
    return;
  }

  const categories = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean).sort())];

  filtersEl.innerHTML = categories.map(c =>
    `<button class="filter-btn${c === 'All' ? ' active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    renderProducts();
  });

  renderProducts();

  function renderProducts() {
    const visible = activeCategory === 'All'
      ? allProducts
      : allProducts.filter(p => p.category === activeCategory);

    if (visible.length === 0) {
      grid.innerHTML = '<div class="loading">No products in this category.</div>';
      return;
    }

    grid.innerHTML = visible.map(p => {
      const outOfStock = p.stockQuantity <= 0;
      const lowStock = !outOfStock && p.stockQuantity <= 5;
      return `
        <div class="product-card${outOfStock ? ' out-of-stock' : ''}" data-id="${p.id}">
          <div class="product-emoji">${p.imageEmoji || '🏅'}</div>
          <div class="product-category">${p.category || ''}</div>
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-desc">${esc(p.description || '')}</div>
          <div class="product-footer">
            <div>
              <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
              ${lowStock ? `<div class="stock-low">Only ${p.stockQuantity} left</div>` : ''}
              ${outOfStock ? '<div class="out-of-stock-label">Out of stock</div>' : ''}
            </div>
            ${outOfStock ? '' : `<button class="btn btn-primary btn-sm add-to-cart" data-id="${p.id}">Add to Cart</button>`}
          </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = allProducts.find(p => p.id === parseInt(btn.dataset.id));
        if (!product) return;
        Cart.addItem(product);
        btn.textContent = 'Added!';
        btn.style.background = 'var(--primary-light)';
        setTimeout(() => {
          btn.textContent = 'Add to Cart';
          btn.style.background = '';
        }, 1200);
      });
    });
  }

  function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
});
