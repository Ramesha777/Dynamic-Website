// Menu data for the restaurant
const menuData = {
  starters: [
    { name: 'Crispy Calamari', price: '£7.95', desc: 'Lightly battered squid rings served with a zesty lemon aioli and chilli flakes.', tag: 'Chef Favourite' },
    { name: 'Soup of the Day', price: '£5.95', desc: "Ask your server for today's freshly made seasonal soup, served with crusty bread.", tag: 'Seasonal' },
    { name: 'Garlic Mushrooms', price: '£6.95', desc: 'Pan-fried button mushrooms in garlic butter and cream, served on toasted sourdough.', tag: 'Vegetarian' },
    { name: 'Prawn Cocktail', price: '£8.50', desc: 'Classic Atlantic prawns Marie Rose sauce shredded gem lettuce rye bread.', tag: 'Classic' }
  ],
  mains: [
    { name: 'Pan-Roasted Salmon', price: '£17.95', desc: 'Scottish salmon fillet asparagus crushed new potatoes dill cream sauce.', tag: 'Gluten Free' },
    { name: 'Chicken Supreme', price: '£16.50', desc: 'Corn-fed chicken breast dauphinoise potato green beans tarragon jus.', tag: 'Chef Favourite' },
    { name: 'Wild Mushroom Risotto', price: '£14.50', desc: 'Creamy arborio risotto truffle oil wild mushrooms parmesan.', tag: 'Vegetarian' },
    { name: 'Beer-Battered Cod', price: '£15.90', desc: 'Classic fish and chips minted mushy peas tartare sauce chunky chips.', tag: 'Classic' }
  ],
  grills: [
    { name: '8oz Sirloin Steak', price: '£26.00', desc: 'Prime dry-aged sirloin grilled to your preference peppercorn sauce and fries.', tag: 'Popular' },
    { name: '10oz Ribeye', price: '£29.00', desc: 'Beautifully marbled ribeye bone marrow butter grilled tomato watercress.', tag: 'Indulgent' },
    { name: 'Lamb Cutlets', price: '£24.00', desc: 'Lamb cutlets with mint sauce and roasted vegetables.', tag: 'Chef Favourite' },
    { name: 'Mixed Grill Platter', price: '£28.00', desc: 'A feast of steaks, burgers, sausages and all the trimmings.', tag: 'Sharing' }
  ],
  desserts: [
    { name: 'Sticky Toffee Pudding', price: '£7.95', desc: 'Warm sponge pudding with toffee sauce and vanilla ice cream.', tag: 'Popular' },
    { name: 'Chocolate Fondant', price: '£8.50', desc: 'Warm chocolate cake with molten center and cream.', tag: 'Indulgent' },
    { name: 'Lemon Tart', price: '£7.50', desc: 'Tangy lemon tart with meringue topping.', tag: 'Light' },
    { name: 'Ice Cream Selection', price: '£5.95', desc: 'Choice of vanilla, strawberry, chocolate or mint.', tag: 'Classic' }
  ]
};

// Simple escape helper
function escapeHtml(s) {
  if (!s) return '';
  const map = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return s.toString().replace(/[&<>"']/g, c => map[c]);
}

// Filter menu by category
function filterMenu(event, category) {
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.menu-tab[data-category="${category}"]`);
  if (activeTab) activeTab.classList.add('active');
  
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  menuData[category].forEach(item => {
    grid.innerHTML += `
      <div class="menu-card">
        <div class="menu-card-header">
          <h3>${item.name}</h3>
          <span class="menu-price">${item.price}</span>
        </div>
        <p>${item.desc}</p>
        <span class="menu-tag">${item.tag}</span>
      </div>
    `;
  });
  addOrderButton();
}

// Add order button below menu
function addOrderButton() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  
  const existing = document.getElementById('menuOrderBtn');
  if (existing) existing.remove();
  
  const orderBtn = document.createElement('div');
  orderBtn.id = 'menuOrderBtn';
  orderBtn.style.gridColumn = '1 / -1';
  orderBtn.style.textAlign = 'center';
  orderBtn.style.marginTop = '20px';
  orderBtn.style.paddingTop = '20px';
  orderBtn.style.borderTop = '1px solid #ddd';
  
  orderBtn.innerHTML = '<a href="https://newrestauran.netlify.app/frontend/customer/customer.html" target="_blank" class="btn-primary" style="display: inline-block;">Order Now</a>';
  
  grid.parentNode.insertBefore(orderBtn, grid.nextSibling);
}

// Load events from Firestore
async function loadPublicEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid || !window.db || !window.getDocs) return;
  
  try {
    const q = window.query(window.collection(window.db, 'events'), window.orderBy('timestamp', 'desc'));
    const snap = await window.getDocs(q);
    grid.innerHTML = '';
    
    if (snap.empty) {
      grid.innerHTML = '<div class="no-events-message">No upcoming events at the moment. Please check back soon!</div>';
      return;
    }
    
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const start = data.startDate || '';
      const end = data.endDate || '';
      const title = data.title || '';
      const desc = data.description || '';
      const img = data.imageUrl || '';
      
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = img 
        ? `<div class="event-thumb"><img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px;"/></div>`
        : '';
      card.innerHTML += `
        <div class="event-body">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(desc)}</p>
          <div class="event-range">${formatRange(start, end)}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Unable to load public events:', err);
    grid.innerHTML += '<div class="no-events-message">Could not load events. Please try again later.</div>';
  }
}

function formatDay(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.getDate();
  } catch {
    return '';
  }
}

function formatMonth(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short' });
  } catch {
    return '';
  }
}

function formatRange(startStr, endStr) {
  if (!startStr && !endStr) return '';
  try {
    const s = startStr ? new Date(startStr) : null;
    const e = endStr ? new Date(endStr) : null;
    
    if (s && e) {
      const same = s.toDateString() === e.toDateString();
      if (same) return s.toLocaleDateString();
      return `${s.toLocaleDateString()} — ${e.toLocaleDateString()}`;
    }
    if (s) return s.toLocaleDateString();
    if (e) return e.toLocaleDateString();
    return '';
  } catch {
    return '';
  }
}

// Load and display restaurant settings
function subscribeToRestaurantSettings() {
  console.log('subscribe settings');
  
  if (!window.db || !window.doc || !window.onSnapshot) {
    setTimeout(subscribeToRestaurantSettings, 300);
    return;
  }
  
  try {
    const ref = window.doc(window.db, 'settings', 'restaurant');
    window.onSnapshot(ref, (snap) => {
      console.log('got setting', snap.exists());
      if (!snap.exists()) return;
      const d = snap.data();
      
      // Update Restaurant Name in Nav Logo
      const navLogoEl = document.querySelector('.nav-logo');
      if (navLogoEl && d.name) {
        navLogoEl.innerHTML = `${d.name}<br><span>Bars & Restaurant</span>`;
      }
      
      // Update Address
      const addressSelectors = [
        '.contact-info p.pub-address',
        '.hours-strip span.pub-address',
        '.map-info strong.pub-address',
        '.footer-copy span'
      ];
      
      addressSelectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el && d.address) {
          el.textContent = d.address;
        }
      });
      
      // Update hours
      const hoursMonThu = document.querySelector('.pub-hours-mon-thu');
      if (hoursMonThu && d.hoursMondayThursday) {
        hoursMonThu.textContent = d.hoursMondayThursday;
      }
      
      const hoursFriSat = document.querySelector('.pub-hours-fri-sat');
      if (hoursFriSat && d.hoursFridaySaturday) {
        hoursFriSat.textContent = d.hoursFridaySaturday;
      }
      
      const hoursSun = document.querySelector('.pub-hours-sun');
      if (hoursSun && d.hoursSunday) {
        hoursSun.textContent = d.hoursSunday;
      }
      
      // Update phone numbers
      const phoneLinks = document.querySelectorAll('[href^="tel:"]');
      phoneLinks.forEach(a => {
        if (d.phone) {
          a.setAttribute('href', `tel:${d.phone.replace(/\D/g, '')}`);
        }
      });
      
      // Update email links
      const emailLinks = document.querySelectorAll('[href^="mailto:"]');
      emailLinks.forEach(a => {
        if (d.email) {
          a.setAttribute('href', `mailto:${d.email}`);
        }
      });
      
      // Render contact options
      renderContactOptions(d.contacts || []);
    });
  } catch (e) {
    console.error(e);
  }
}

// Render contact options dynamically
function renderContactOptions(contacts) {
  const menu = document.getElementById('whatsappContactsMenu');
  if (menu == null) return;
  
  menu.innerHTML = '';
  contacts.forEach(contact => {
    // Guard: skip if phone is undefined or missing
    if (!contact || !contact.phone) return;
    
    const item = document.createElement('a');
    item.href = `https://wa.me/${contact.phone.replace(/\D/g, '')}`;
    item.target = '_blank';
    item.className = 'contact-option';
    item.innerHTML = `<i class="fab fa-whatsapp"></i> ${contact.name}`;
    menu.appendChild(item);
  });
}

// Initialize menu if on menu page
if (document.getElementById('menuGrid')) {
  filterMenu(null, 'starters');
}

// Initialize events if on events page  
if (document.getElementById('eventsGrid')) {
  loadPublicEvents();
}

// Initialize settings
subscribeToRestaurantSettings();
