const menuData = {
  starters: [
    { name: 'Crispy Calamari', price: '£7.95', desc: 'Lightly battered squid rings served with a zesty lemon aioli and chilli flakes.', tag: 'Chef Favourite' },
    { name: 'Soup of the Day', price: '£5.95', desc: 'Ask your server for today\'s freshly made seasonal soup, served with crusty bread.', tag: 'Seasonal' },
    { name: 'Garlic Mushrooms', price: '£6.95', desc: 'Pan-fried button mushrooms in garlic butter and cream, served on toasted sourdough.', tag: 'Vegetarian' },
    { name: 'Prawn Cocktail', price: '£8.50', desc: 'Classic Atlantic prawns in Marie Rose sauce with shredded gem lettuce and rye bread.', tag: 'Classic' },
  ],
  mains: [
    { name: 'Pan-Roasted Salmon', price: '£17.95', desc: 'Scottish salmon fillet, asparagus, crushed new potatoes and dill cream sauce.', tag: 'Gluten Free' },
    { name: 'Chicken Supreme', price: '£16.50', desc: 'Corn-fed chicken breast, dauphinoise potato, green beans and tarragon jus.', tag: 'Chef Favourite' },
    { name: 'Wild Mushroom Risotto', price: '£14.50', desc: 'Creamy arborio risotto with truffle oil, mixed wild mushrooms and parmesan.', tag: 'Vegetarian' },
    { name: 'Beer-Battered Cod', price: '£15.95', desc: 'Classic fish and chips with minted mushy peas, tartare sauce and chunky chips.', tag: 'British Classic' },
  ],
  grills: [
    { name: '8oz Sirloin Steak', price: '£26.95', desc: 'Prime dry-aged sirloin grilled to your preference with peppercorn sauce and fries.', tag: 'Popular' },
    { name: '10oz Ribeye', price: '£29.95', desc: 'Beautifully marbled ribeye with bone marrow butter, grilled tomato and watercress.', tag: 'Indulgent' },
    { name: 'Lamb Cutlets', price: '£24.95', desc: 'Welsh lamb cutlets with minted pea purée, heritage carrots and rosemary jus.', tag: 'Seasonal' },
    { name: 'Mixed Grill Platter', price: '£32.95', desc: 'Sirloin medallion, lamb chop, chicken breast, gammon and pork sausages.', tag: 'Share' },
  ],
  desserts: [
    { name: 'Sticky Toffee Pudding', price: '£6.95', desc: 'Warm date sponge smothered in toffee sauce with vanilla clotted cream.', tag: 'Most Loved' },
    { name: 'Chocolate Fondant', price: '£7.95', desc: 'Warm dark chocolate fondant with a molten centre, served with vanilla ice cream.', tag: 'Indulgent' },
    { name: 'Lemon Tart', price: '£6.50', desc: 'Classic French lemon tart with a buttery pastry shell and raspberry coulis.', tag: 'Light' },
    { name: 'Ice Cream Selection', price: '£5.95', desc: 'Three scoops of locally-made ice cream. Ask your server for today\'s flavours.', tag: 'Dairy' },
  ]
};

// simple escape helper
function escapeHtml(s) {
  if (!s) return '';
  return s.toString().replace(/[&<>"]+/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c;
  });
}

function filterMenu(e, category) {
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  if (e && e.target) e.target.classList.add('active');
  const grid = document.getElementById('menuGrid');
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
      </div>`;
  });
  addOrderButton();
}

// Add order button below menu
function addOrderButton() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  
  // Remove existing order button if present
  const existing = document.getElementById('menuOrderBtn');
  if (existing) existing.remove();
  
  const orderBtn = document.createElement('div');
  orderBtn.id = 'menuOrderBtn';
  orderBtn.style.gridColumn = '1 / -1';
  orderBtn.style.textAlign = 'center';
  orderBtn.style.marginTop = '20px';
  orderBtn.style.paddingTop = '20px';
  orderBtn.style.borderTop = '1px solid #ddd';
  
  orderBtn.innerHTML = `
    <a href="https://newrestauran.netlify.app/frontend/customer/customer.html" target="_blank" class="btn-primary" style="display:inline-block;">
      Order Now
    </a>
  `;
  
  grid.parentNode.insertBefore(orderBtn, grid.nextSibling);
}

// Load events from Firestore (if available)
async function loadPublicEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid || !window.db || !window.getDocs) return;
  try {
    const q = window.query(window.collection(window.db, 'events'), window.orderBy('timestamp', 'desc'));
    const snap = await window.getDocs(q);
    grid.innerHTML = ''; // Clear loader only after data is fetched
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
      card.innerHTML = `
        ${img ? `<div class="event-thumb"><img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;"/></div>` : ''}
        <div class="event-body">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(desc)}</p>
          <div class="event-range">${escapeHtml(formatRange(start, end))}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Unable to load public events:', err);
    grid.innerHTML = '<div class="no-events-message">Could not load events. Please try again later.</div>';
  }
}

function formatDay(dateStr) {
  if (!dateStr) return '';
  try { const d = new Date(dateStr); return d.getDate(); } catch { return ''; }
}
function formatMonth(dateStr) {
  if (!dateStr) return '';
  try { const d = new Date(dateStr); return d.toLocaleString('default', { month: 'short' }); } catch { return ''; }
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
  } catch { return ''; }
}

// Load and display restaurant settings (name, address, phone, email)
function subscribeToRestaurantSettings() {
  if (!window.db) {
    setTimeout(subscribeToRestaurantSettings, 500);
    return;
  }

  // Use realtime listener if available, otherwise fallback to one-time load
  if (window.onSnapshot && window.doc) {
    try {
      window.onSnapshot(window.doc(window.db, 'settings', 'restaurant'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Update nav-logo (restaurant name)
          const navLogo = document.querySelector('.nav-logo');
          if (navLogo && data.name) {
            navLogo.innerHTML = `${escapeHtml(data.name)}<br><span>Bars & Restaurant</span>`;
          }
          
          // Update hours-strip with hours
          const hoursStrip = document.querySelector('.hours-strip');
          if (hoursStrip) {
            const hoursItems = hoursStrip.querySelectorAll('.hours-item');
            if (hoursItems[0] && data.hoursMondayThursday) {
              hoursItems[0].innerHTML = `<strong>Mon-Thu:</strong> ${escapeHtml(data.hoursMondayThursday)}`;
            }
            if (hoursItems[1] && data.hoursFridaySaturday) {
              hoursItems[1].innerHTML = `<strong>Fri-Sat:</strong> ${escapeHtml(data.hoursFridaySaturday)}`;
            }
            if (hoursItems[2] && data.hoursSunday) {
              hoursItems[2].innerHTML = `<strong>Sunday:</strong> ${escapeHtml(data.hoursSunday)}`;
            }
          }
          
          // Update contact info (address, phone, email, hours)
          const contactInfo = document.querySelector('.contact-info');
          if (contactInfo) {
            const paragraphs = contactInfo.querySelectorAll('p');
            // Update first three paragraphs: address, phone, email
            if (paragraphs[0] && data.address) paragraphs[0].textContent = data.address;
            if (paragraphs[1] && data.phone) paragraphs[1].textContent = data.phone;
            if (paragraphs[2] && data.email) paragraphs[2].textContent = data.email;
            
            // Update fourth paragraph: hours
            if (paragraphs[3] && data.hoursMondayThursday && data.hoursFridaySaturday && data.hoursSunday) {
              paragraphs[3].innerHTML = `${escapeHtml(data.hoursMondayThursday)}<br>${escapeHtml(data.hoursFridaySaturday)}<br>${escapeHtml(data.hoursSunday)}`;
            }
          }
        }
      });
      return;
    } catch (err) {
      console.error('Settings subscription error:', err);
    }
  }
}

// If realtime `onSnapshot` is available, subscribe; otherwise do a one-time load
function subscribePublicEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  // Wait for Firebase to initialize with all required functions
  if (!window.db || !window.onSnapshot || !window.collection || !window.query || !window.orderBy) {
    setTimeout(subscribePublicEvents, 500);
    return;
  }

  // Show loading indicator immediately
  grid.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

  try {
    const q = window.query(window.collection(window.db, 'events'), window.orderBy('timestamp', 'desc'));
    // Use realtime listener
    window.onSnapshot(q, (snap) => {
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
        card.innerHTML = `
          ${img ? `<div class="event-thumb"><img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;"/></div>` : ''}
          <div class="event-body">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(desc)}</p>
            <div class="event-range">${escapeHtml(formatRange(start, end))}</div>
          </div>
        `;
        grid.appendChild(card);
      });
    });
  } catch (err) {
    console.error('Realtime event subscription failed:', err);
    grid.innerHTML = '<div class="no-events-message">Could not load events. Please try again later.</div>';
  }
}

// Ensure Firebase is ready before subscribing to events
function initializePublicPage() {
  if (!window.db || !window.collection || !window.query || !window.orderBy || !window.onSnapshot) {
    setTimeout(initializePublicPage, 300);
    return;
  }
  subscribePublicEvents();
  subscribeToRestaurantSettings();
}

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.background = window.scrollY > 80
    ? 'rgba(10,10,10,0.98)'
    : 'rgba(10,10,10,0.92)';
});
// save reservation to firesbase firestore
async function saveReservation(name, email, date, time, guests) {
  const reservationCode = Math.floor(1000 + Math.random() * 9000);
  
  try {
    await window.addDoc(window.collection(window.db, 'reservations'), {
      name,
      email,
      date,
      time,
      guests,
      code: reservationCode,
      status: 'Pending',
      timestamp: new Date()
    });
    
    alert(`Thank you for your reservation! Your reservation code is: ${reservationCode}`);
    document.getElementById('reservationForm').reset();
  } catch (error) {
    console.error('Error saving reservation: ', error);
    alert('There was an error saving your reservation. Please try again.');
  }
}

// shows confirmation message after reservation form is submitted with four digit reservation code
if (document.getElementById('reservationForm')) {
  document.getElementById('reservationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('resName').value;
    const email = document.getElementById('resEmail').value;
    const date = document.getElementById('resDate').value;
    const time = document.getElementById('resTime').value;
    const guests = document.getElementById('resGuests').value;
    
    saveReservation(name, email, date, time, guests);
  });
}

// Ensure everything initializes when script loads
if (document.readyState === 'loading') {
  // DOM still loading, wait for it
  document.addEventListener('DOMContentLoaded', () => {
    const menuTabElement = document.querySelector('.menu-tab');
    if (menuTabElement) {
      menuTabElement.click();
    }
    initializePublicPage();
  });
} else {
  // DOM already loaded, initialize immediately
  const menuTabElement = document.querySelector('.menu-tab');
  if (menuTabElement) {
    menuTabElement.click();
  }
  initializePublicPage();
}
