// Menu data for the restaurant
const menuData = {
  starters: [
    { name: 'Soya Manchurian', price: '£9.25', desc: 'Marinated soya pcs infused with chef special manchurain sauce.', tag: 'Veg Starter' },
    { name: 'Panner Tikka', price: '£8.49', desc: "Premium Indian cottage cheese marinated in spices and place in out tandoor. This is cooked by dandling it above a live fire", tag: 'Veg Starter' },
    { name: 'Chilli Prawns', price: '£9.49', desc: 'What a treat Battered King Prawns fried and tossed in a spicy sauce with onions and bell peppers.', tag: 'Non-Veg' },
    { name: 'Tandoori Fish Tikka', price: '£8.99', desc: 'Special cuts of Panga Fish infused with aromatic herds and spices cooked in the Tandoor.', tag: 'Nov-veg' }
  ],
  mains: [
    { name: 'Garlic Chilli Chicken', price: '£9.99', desc: 'Pcs of chicken cooked in chilli ginger, garlic, making nice and hot sauce.', tag: 'Chef Special' },
    { name: 'Lamb Claypot', price: '£10.49', desc: 'Slow cooked lamb with chefs special Sauce.', tag: 'Chef Favourite' },
    { name: 'Soya Butter chicken', price: '£8.55', desc: '#Chunks of Soya chicken and mixed with reach creamy sauce.', tag: 'Vegetarian' },
    { name: 'Panner Makhni', price: '£8.50', desc: 'Indian Cottage Cheese cooked in a rich and creamy sauce, contain nuts and dairies.', tag: 'Veggie Main' }
  ],
  grills: [
    { name: 'Large Mix Grill', price: '£19.99', desc: 'Lamb chops, Chicken tikka, chicken wings and Kebab.', tag: 'Popular' },
    { name: 'Mo:Mo Chicken', price: '£6.99', desc: 'Served with spicy tomato Chutney (8pcs).', tag: 'Nepali Favourite' },
    { name: 'Boneless Mix Grill', price: '£17.49', desc: 'Sheek Kebab, Chicken Tikka and fish Tikka.', tag: 'Mix grill' },
    { name: 'Mixed Grill Veg', price: '£18.99', desc: 'Soya chicken, Soya Lamb and Paneer Tikka.', tag: 'Chef special' }
  ],
  desserts: [
    { name: 'Maltesers Cheese Cake', price: '£4.99', desc: '', tag: 'Popular' },
    { name: 'Gulab Jamun and Ice Cream', price: '£4.99', desc: '', tag: 'Indian Style' },
    { name: 'Matka Kulfi', price: '£4.99', desc: '', tag: 'Delicious' },
    { name: 'Cholocate Brownie with Ice cream', price: '£4.99', desc: '', tag: 'Classic' }
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
      // Update Restaurant Name in Footer Logo
      const footerLogoEl = document.querySelector('.footer-logo');
      if (footerLogoEl && d.name) {
        footerLogoEl.innerHTML = `${d.name} <span>Bars & Restaurant</span>`;
      }

      // Update Restaurant Name in Footer Copyright
      const footerCopyNameEl = document.querySelector('.footer-restaurant-name');
      if (footerCopyNameEl && d.name) {
        footerCopyNameEl.textContent = `${d.name} Bars & Restaurant`;
      }
      
      // Update Address
      const addressSelectors = [
        '.contact-info p.pub-address',
        '.hours-strip span.pub-address',
        '.map-info strong.pub-address',
        '.footer-copy .pub-address'
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
      
      // Update phone numbers - both href AND text content
      const phoneLinks = document.querySelectorAll('[href^="tel:"]');
      phoneLinks.forEach(a => {
        if (d.phone) {
          a.setAttribute('href', `tel:${d.phone.replace(/\D/g, '')}`);
          a.textContent = d.phone;
        }
      });
      
      // Also update any elements with .pub-phone class (non-link phone display)
      const phoneDisplays = document.querySelectorAll('.pub-phone');
      phoneDisplays.forEach(el => {
        if (d.phone) {
          el.textContent = d.phone;
        }
      });

      // Update email links - both href AND text content
      const emailLinks = document.querySelectorAll('[href^="mailto:"]');
      emailLinks.forEach(a => {
        if (d.email) {
          a.setAttribute('href', `mailto:${d.email}`);
          a.textContent = d.email;
        }
      });

      // Also update any elements with .pub-email class (non-link email display)
      const emailDisplays = document.querySelectorAll('.pub-email');
      emailDisplays.forEach(el => {
        if (d.email) {
          el.textContent = d.email;
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
  if (!contacts || contacts.length === 0) {
    // If no contacts, show a default WhatsApp option
    const item = document.createElement('a');
    item.href = 'https://wa.me/';
    item.target = '_blank';
    item.className = 'whatsapp-option';
    item.innerHTML = `
      <div class="option-icon"><i class="fab fa-whatsapp"></i></div>
      <div>
        <strong>Contact Us</strong>
        <p>via WhatsApp</p>
      </div>
    `;
    menu.appendChild(item);
    return;
  }

  contacts.forEach(contact => {
    // Admin saves as type and value, we need to handle both formats
    const displayName = contact.type || contact.name || 'Contact';
    const contactValue = contact.value || contact.phone || '';
    const purpose = contact.purpose || '';
    
    let href = '#';
    let iconClass = 'fab fa-whatsapp'; // Default icon

    if (contact.type === 'WhatsApp' || contact.type === 'Whatsapp' || contact.type === 'whatsapp') {
      // WhatsApp - use phone number
      href = `https://wa.me/${contactValue.replace(/\D/g, '')}`;
      iconClass = 'fab fa-whatsapp';
    } else if (contact.type === 'Email' || contact.type === 'email') {
      // Email
      href = `mailto:${contactValue}`;
      iconClass = 'fas fa-envelope';
    } else if (contact.type === 'Phone' || contact.type === 'phone') {
      // Regular phone
      href = `tel:${contactValue.replace(/\D/g, '')}`;
      iconClass = 'fas fa-phone';
    } else if (contact.type === 'Link' || contact.type === 'link') {
      // Generic link
      href = contactValue.startsWith('http') ? contactValue : `https://${contactValue}`;
      iconClass = 'fas fa-link';
    } else {
      // Default to WhatsApp format for unknown types
      href = `https://wa.me/${contactValue.replace(/\D/g, '')}`;
      iconClass = 'fab fa-whatsapp';
    }
    
    const item = document.createElement('a');
    item.href = href;
    item.target = '_blank';
    item.className = 'whatsapp-option';
    item.innerHTML = `
      <div class="option-icon"><i class="${iconClass}"></i></div>
      <div>
        <strong>${escapeHtml(displayName)}</strong>
        ${purpose ? `<div style="font-size: 0.85rem; color: #e8650a; margin-bottom: 2px;">${escapeHtml(purpose)}</div>` : ''}
        <p>${escapeHtml(contactValue)}</p>
      </div>
    `;
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
