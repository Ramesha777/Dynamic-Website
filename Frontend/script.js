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
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return s.toString().replace(/[&<>"']/g, c => map[c]);
}

// Filter menu by category (homepage preview — static sample dishes only)
function filterMenu(event, category) {
  document.querySelectorAll('#menu .menu-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`#menu .menu-tab[data-category="${category}"]`);
  if (activeTab) activeTab.classList.add('active');

  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  grid.innerHTML = '';
  (menuData[category] || []).forEach(item => {
    grid.innerHTML += `
      <div class="menu-card">
        <div class="menu-card-header">
          <h3>${escapeHtml(item.name)}</h3>
          <span class="menu-price">${escapeHtml(item.price)}</span>
        </div>
        <p>${escapeHtml(item.desc)}</p>
        <span class="menu-tag">${escapeHtml(item.tag)}</span>
      </div>
    `;
  });
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

      renderDeliveryOptions({
        deliveroo: d.deliverooUrl || '',
        justEat: d.justEatUrl || '',
        uberEats: d.uberEatsUrl || ''
      });
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

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function renderDeliveryOptions(links) {
  const menu = document.getElementById('orderNowMenu');
  if (!menu) return;

  const services = [
    {
      key: 'deliveroo',
      name: 'Deliveroo',
      className: 'deliveroo',
      url: links.deliveroo,
      hint: 'Order for delivery',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.861 0l-1.127 10.584L13.81 1.66 7.777 2.926l1.924 8.922-8.695 1.822 1.535 7.127L17.832 24l3.498-7.744L22.994.636 16.861 0zM11.39 13.61a.755.755 0 01.322.066c.208.093.56.29.63.592.103.434.004.799-.312 1.084v.002c-.315.284-.732.258-1.174.113-.441-.145-.637-.672-.47-1.309.124-.473.71-.544 1.004-.549zm4.142.548c.447-.012.832.186 1.05.543.217.357.107.75-.122 1.143h-.002c-.229.392-.83.445-1.422.16-.399-.193-.397-.684-.353-.983a.922.922 0 01.193-.447c.142-.177.381-.408.656-.416Z"/></svg>'
    },
    {
      key: 'justEat',
      name: 'Just Eat',
      className: 'justeat',
      url: links.justEat,
      hint: 'Order for delivery',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.196.232a1.376 1.376 0 0 1 1.528 0 33.157 33.157 0 0 1 3.384 2.438s.293.203.301-.14a5.367 5.367 0 0 1 .079-1.329.606.606 0 0 1 .562-.39s1.329.066 2.173.179c.377.05.671.352.711.73 0 0 .543 3.62.665 4.925 0 0 .105.664 1.067 1.79 0 0 1.953 2.735 2.18 3.259 0 0 .454.946-.523 1.074 0 0-1.783.18-1.955.22a.446.446 0 0 0-.39.484s-.094 6.296-.555 9.32c0 0-.121 1.2-.782 1.173 0 0-1.833-.059-2.259-.047 0 0-.183 0-.156-.246 0 0 .934-9.817.301-14.78 0 0-.028-.64-.516-.782 0 0-.445-.18-.871.391a15.574 15.574 0 0 0-2.9 8.86s-.05 1.563.188 1.953c0 0 .148.274.907.336l.96.13s.176 0 .16.233c0 0-.218 2.88-.28 3.393a1.018 1.018 0 0 1-.071.34s-.035.098-.336.086c0 0-4.236-.03-4.713 0 0 0-.2 0-.242-.105-.043-.106-.294-3.717-.286-4.229a.255.255 0 0 1 .149-.25 2.548 2.548 0 0 0 1.172-1.871c.052-.548.06-1.098.024-1.646 0 0 .156-5.522.195-6.41 0 0 .031-.3-.36-.355a.364.364 0 0 0-.437.27v.03c0 .032-.274 3.643-.223 5.081 0 0 .094.942-.558.961 0 0-.634.095-.665-.69 0 0 .047-3.542.203-5.292a.39.39 0 0 0-.348-.391.39.39 0 0 0-.437.316.065.065 0 0 0 0 .031s-.274 3.39-.223 5.179c0 0 .078.868-.614.836 0 0-.578.066-.61-.704 0 0 .157-4.85.2-5.224A.39.39 0 0 0 6.647 9h-.039a.391.391 0 0 0-.418.325.167.167 0 0 0 0 .035s-.258 5.8-.223 7.503c0 0-.023 1.751 1.27 2.462 0 0 .192.11.196.277 0 0 .145 3.076.277 4.069 0 0 .047.238-.164.238L4.291 24a.67.67 0 0 1-.665-.633 72.876 72.876 0 0 1-.601-9.829.5.5 0 0 0-.391-.535S.969 12.85.566 12.749a.692.692 0 0 1-.422-1.02A33.497 33.497 0 0 1 11.197.232Z"/></svg>'
    },
    {
      key: 'uberEats',
      name: 'Uber Eats',
      className: 'ubereats',
      url: links.uberEats,
      hint: 'Order for delivery',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M0 2.8645v4.9972c0 1.8834 1.3315 3.1297 3.0835 3.1297a2.9652 2.9652 0 0 0 2.1502-.876v.7425H6.445V2.8645H5.223v4.9339c0 1.2642-.8696 2.1198-1.9954 2.122-1.1386-.0023-1.997-.834-1.997-2.122V2.8645zm7.3625 0v7.9934h1.163v-.7318a2.9915 2.9915 0 0 0 2.1177.876c1.714.048 3.1295-1.3283 3.1295-3.0429s-1.4155-3.091-3.1295-3.0429a2.9674 2.9674 0 0 0-2.107.876V2.8645zm9.8857 2.0561c-1.6752-.0074-3.0369 1.3492-3.0356 3.0245 0 1.7366 1.3732 3.0373 3.1537 3.0373a3.123 3.123 0 0 0 2.5578-1.2438l-.8495-.6177a2.0498 2.0498 0 0 1-1.7083.8585c-.9763.0126-1.8147-.6915-1.971-1.6553h4.818v-.379c0-1.734-1.254-3.0238-2.9638-3.0245zm6.1632.0667a1.5943 1.5943 0 0 0-1.376.7657v-.7186h-1.163v5.8235h1.1741V7.5465c0-.9023.5581-1.4847 1.3268-1.4847h.4949V4.9886c-.1576.0013-.3186-.0009-.4568-.0013zm-6.2034.944a1.844 1.844 0 0 1 1.8337 1.486H15.424a1.844 1.844 0 0 1 1.784-1.486zm-6.6589.0056c1.1223-.0084 2.0365.8992 2.0364 2.0215-.0026 1.1203-.914 2.0258-2.0343 2.021a2.0151 2.0151 0 0 1-1.4159-.5987A2.0152 2.0152 0 0 1 8.55 7.9592a2.0152 2.0152 0 0 1 .5838-1.422 2.0152 2.0152 0 0 1 1.4153-.6003zM0 12.9864v7.9716h5.7222v-1.3666H1.5458v-1.971h4.0647v-1.314H1.5458v-1.9556h4.1764v-1.3644zm14.5608.4097v1.6861h-1.1519v1.338h1.1545v3.143c0 .7927.5712 1.4209 1.6005 1.4209h1.6425L17.8 19.646h-1.1412c-.3482 0-.5714-.1509-.5714-.464v-2.7683H17.8v-1.3316h-1.7062v-1.686zm-5.2974 1.5275c-1.7348-.0103-3.141 1.4035-3.1214 3.1382.0196 1.7346 1.4575 3.1163 3.1915 3.0668a2.9915 2.9915 0 0 0 1.912-.6655v.532h1.5175v-5.9129h-1.509v.5257a3.0047 3.0047 0 0 0-1.9205-.6835c-.0244-.0007-.0492-.0006-.0701-.0008zm11.771.0077c-1.5855 0-2.7002.6437-2.7002 1.8854 0 .8607.6132 1.4213 1.936 1.695l1.4478.3286c.5694.1095.7224.2585.7224.4906 0 .3701-.438.6022-1.1279.6022-.876 0-1.3774-.1907-1.5723-.8477h-1.533c.219 1.2307 1.1563 2.05 3.0484 2.05h.0022c1.752 0 2.7422-.819 2.7422-1.9534 0-.8059-.5847-1.4084-1.8089-1.6668l-1.2943-.2605c-.7511-.1358-.988-.2738-.988-.5454 0-.357.3616-.5757 1.0295-.5757.7227 0 1.2527.1925 1.406.8473h1.5175c-.0854-1.2286-.9899-2.0497-2.8273-2.0497zM9.467 16.1815c1.0092.0096 1.8188.8369 1.8067 1.8461.0014 1.0046-.8198 1.816-1.8243 1.8025-1.0075-.0048-1.8203-.8256-1.8155-1.833.0048-1.0076.8255-1.8204 1.833-1.8156z"/></svg>'
    }
  ];

  menu.innerHTML = '';
  services.forEach(service => {
    const href = normalizeUrl(service.url);
    const item = document.createElement(href ? 'a' : 'div');
    item.className = href ? 'order-option' : 'order-option is-disabled';
    if (href) {
      item.href = href;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.setAttribute('role', 'menuitem');
    }
    item.innerHTML = `
      <div class="option-icon ${service.className}">${service.icon}</div>
      <div>
        <strong>${service.name}</strong>
        <p>${href ? service.hint : 'Link not set yet'}</p>
      </div>
    `;
    menu.appendChild(item);
  });
}

function initOrderNowPopup() {
  const wrap = document.getElementById('menuOrderBtn');
  const btn = document.getElementById('orderNowBtn');
  if (!wrap || !btn) return;

  renderDeliveryOptions({ deliveroo: '', justEat: '', uberEats: '' });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Initialize homepage menu preview (static sample). Full menu + photos are on menu.html.
if (document.getElementById('menuGrid')) {
  filterMenu(null, 'starters');
}

initOrderNowPopup();

// Initialize events if on events page  
if (document.getElementById('eventsGrid')) {
  loadPublicEvents();
}

// Initialize settings
subscribeToRestaurantSettings();
