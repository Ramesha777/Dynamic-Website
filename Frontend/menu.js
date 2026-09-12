function escapeHtml(s) {
  if (!s) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return s.toString().replace(/[&<>"']/g, c => map[c]);
}

function normalizeImageUrl(value) {
  let url = String(value || '').trim();
  if (!url) return '';
  const htmlSrc = url.match(/src\s*=\s*["']([^"']+)["']/i);
  if (htmlSrc) url = htmlSrc[1].trim();
  const md = url.match(/\((https?:\/\/[^)\s]+)\)/i);
  if (md) url = md[1].trim();
  url = url.replace(/^<|>$/g, '').trim();
  if (url.startsWith('//')) url = `https:${url}`;
  if (/^www\./i.test(url)) url = `https://${url}`;
  if (!/^https?:\/\//i.test(url)) return '';
  return url;
}

function getDishImageUrl(item) {
  if (!item || typeof item !== 'object') return '';
  return normalizeImageUrl(
    item.imageUrl || item.image || item.photoUrl || item.photo || item.img || item.imageLink || ''
  );
}

let exploreItems = [];
let activeCategory = 'all';

function uniqueCategories(items) {
  const seen = new Set();
  const cats = [];
  items.forEach(item => {
    const cat = (item.category || 'Uncategorised').trim() || 'Uncategorised';
    if (!seen.has(cat)) {
      seen.add(cat);
      cats.push(cat);
    }
  });
  return cats;
}

function renderCategoryTabs(categories) {
  const wrap = document.getElementById('exploreCategoryTabs');
  if (!wrap) return;
  wrap.innerHTML = `<button type="button" class="menu-tab ${activeCategory === 'all' ? 'active' : ''}" data-category="all">All</button>` +
    categories.map(cat => `
      <button type="button" class="menu-tab ${activeCategory === cat ? 'active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
    `).join('');
}

function dishImageMarkup(url, alt) {
  if (!url) return '';
  const safeUrl = escapeHtml(url);
  const safeAlt = escapeHtml(alt || 'Dish');
  return `<div class="menu-card-image">
      <img src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" referrerpolicy="no-referrer"
        onerror="if(!this.dataset.retry){this.dataset.retry='1';const u=this.src;this.removeAttribute('referrerpolicy');this.removeAttribute('src');this.src=u;}else{this.parentElement.classList.add('is-broken');}">
    </div>`;
}

function dishCard(item) {
  const url = getDishImageUrl(item);
  const image = dishImageMarkup(url, item.name);
  return `
    <div class="menu-card${image ? ' has-image' : ''}">
      ${image}
      <div class="menu-card-body">
        <div class="menu-card-header">
          <h3>${escapeHtml(item.name || '')}</h3>
          <span class="menu-price">${escapeHtml(item.price || '')}</span>
        </div>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        ${item.tag ? `<span class="menu-tag">${escapeHtml(item.tag)}</span>` : ''}
      </div>
    </div>
  `;
}

function renderExploreMenu() {
  const content = document.getElementById('exploreMenuContent');
  if (!content) return;

  const search = (document.getElementById('exploreSearch')?.value || '').toLowerCase().trim();
  let filtered = exploreItems.filter(item => {
    const cat = (item.category || 'Uncategorised').trim() || 'Uncategorised';
    if (activeCategory !== 'all' && cat !== activeCategory) return false;
    if (!search) return true;
    return [item.name, item.description, item.category, item.tag, item.price]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  if (!exploreItems.length) {
    content.innerHTML = '<div class="explore-empty">The full menu will appear here once it is imported in the admin panel.</div>';
    return;
  }

  if (!filtered.length) {
    content.innerHTML = '<div class="explore-empty">No dishes match your search.</div>';
    return;
  }

  if (activeCategory !== 'all') {
    content.innerHTML = `<div class="menu-grid">${filtered.map(dishCard).join('')}</div>`;
    return;
  }

  const cats = uniqueCategories(filtered);
  content.innerHTML = cats.map(cat => {
    const dishes = filtered.filter(item => ((item.category || 'Uncategorised').trim() || 'Uncategorised') === cat);
    return `
      <div class="explore-category-block">
        <h2 class="explore-category-title">${escapeHtml(cat)}</h2>
        <div class="menu-grid">${dishes.map(dishCard).join('')}</div>
      </div>
    `;
  }).join('');
}

async function loadExploreMenu() {
  const content = document.getElementById('exploreMenuContent');
  if (!window.db || !window.getDocs || !window.collection) {
    setTimeout(loadExploreMenu, 200);
    return;
  }
  try {
    const snap = await window.getDocs(window.collection(window.db, 'menuItems'));
    exploreItems = [];
    snap.forEach(docSnap => {
      exploreItems.push({ id: docSnap.id, ...docSnap.data() });
    });
    exploreItems.sort((a, b) => {
      const cat = String(a.category || '').localeCompare(String(b.category || ''));
      if (cat !== 0) return cat;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    renderCategoryTabs(uniqueCategories(exploreItems));
    renderExploreMenu();
  } catch (err) {
    console.error('Unable to load full menu:', err);
    if (content) content.innerHTML = '<div class="explore-empty">Could not load the menu. Please try again later.</div>';
  }
}

document.getElementById('exploreSearch')?.addEventListener('input', renderExploreMenu);

document.getElementById('exploreCategoryTabs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.menu-tab');
  if (!btn) return;
  activeCategory = btn.getAttribute('data-category') || 'all';
  document.querySelectorAll('#exploreCategoryTabs .menu-tab').forEach(tab => tab.classList.remove('active'));
  btn.classList.add('active');
  renderExploreMenu();
});

loadExploreMenu();
