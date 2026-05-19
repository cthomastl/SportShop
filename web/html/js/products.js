document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('product-grid');
  const sidebarCats = document.getElementById('sidebar-categories');
  const breadcrumb = document.getElementById('cat-breadcrumb');
  const sectionHead = document.getElementById('section-head');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  let allProducts = [];
  let activeCategory = 'All';
  let searchQuery = '';

  try {
    allProducts = await apiFetch('/products');
  } catch (e) {
    grid.innerHTML = `<div class="grid-loading">Failed to load products: ${e.message}</div>`;
    return;
  }

  const categories = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean).sort())];

  sidebarCats.innerHTML = categories.map(c =>
    `<a href="#" class="cat-link${c === 'All' ? ' active' : ''}" data-cat="${c}">${c === 'All' ? 'All Products' : c}</a>`
  ).join('');

  sidebarCats.addEventListener('click', e => {
    const link = e.target.closest('.cat-link');
    if (!link) return;
    e.preventDefault();
    activeCategory = link.dataset.cat;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    sidebarCats.querySelectorAll('.cat-link').forEach(l => l.classList.toggle('active', l === link));
    updateBreadcrumb();
    renderProducts();
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', doSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }

  renderProducts();

  function doSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    activeCategory = 'All';
    sidebarCats.querySelectorAll('.cat-link').forEach(l => l.classList.toggle('active', l.dataset.cat === 'All'));
    updateBreadcrumb();
    renderProducts();
  }

  function updateBreadcrumb() {
    if (searchQuery) {
      breadcrumb.textContent = `Search results for "${searchQuery}"`;
      sectionHead.textContent = `Search: "${searchQuery}"`;
    } else if (activeCategory === 'All') {
      breadcrumb.textContent = 'All Categories';
      sectionHead.textContent = 'All Products';
    } else {
      breadcrumb.innerHTML = `<a href="#" id="bc-home">All Categories</a> &rsaquo; ${esc(activeCategory)}`;
      sectionHead.textContent = activeCategory;
      document.getElementById('bc-home').addEventListener('click', e => {
        e.preventDefault();
        activeCategory = 'All';
        searchQuery = '';
        sidebarCats.querySelectorAll('.cat-link').forEach(l => l.classList.toggle('active', l.dataset.cat === 'All'));
        updateBreadcrumb();
        renderProducts();
      });
    }
  }

  function renderProducts() {
    let visible = activeCategory === 'All' ? allProducts : allProducts.filter(p => p.category === activeCategory);
    if (searchQuery) {
      visible = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery) ||
        (p.category || '').toLowerCase().includes(searchQuery) ||
        (p.description || '').toLowerCase().includes(searchQuery)
      );
    }

    if (visible.length === 0) {
      grid.innerHTML = '<div class="grid-loading">No products found.</div>';
      return;
    }

    grid.innerHTML = visible.map(p => {
      const oos = p.stockQuantity <= 0;
      const low = !oos && p.stockQuantity <= 5;
      return `
        <div class="product-tile" data-id="${p.id}">
          <div class="tile-img">${p.imageEmoji || '🏅'}</div>
          <div class="tile-cat">${esc(p.category || '')}</div>
          <div class="tile-name">${esc(p.name)}</div>
          <div class="tile-desc">${esc(p.description || '')}</div>
          <div class="tile-price">$${parseFloat(p.price).toFixed(2)}</div>
          ${low ? `<div class="tile-stock-low">Only ${p.stockQuantity} left</div>` : ''}
          ${oos
            ? `<div class="tile-oos-label">Out of Stock</div>`
            : `<button class="btn btn-green btn-sm add-to-cart" data-id="${p.id}">Add to Cart</button>`}
        </div>`;
    }).join('');

    grid.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = allProducts.find(p => p.id === parseInt(btn.dataset.id));
        if (!product) return;
        Cart.addItem(product);
        const orig = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.background = 'linear-gradient(to bottom,#3a8a3a,#1a5a1a)';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
        }, 1200);
      });
    });
  }

  function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
});
