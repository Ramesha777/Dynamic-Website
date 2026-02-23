// Frontend admin script (module)
import { firebaseConfig } from '../Backend/firebaseconfig.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, addDoc, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Initialize Firebase (modular)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check authentication state
onAuthStateChanged(auth, (user) => {
  const loadingScreen = document.getElementById('loadingScreen');
  const authCheck = document.getElementById('authCheck');
  const notAuthorized = document.getElementById('notAuthorized');
  const userEmail = document.getElementById('userEmail');

  if (loadingScreen) loadingScreen.style.display = 'none';

  if (user) {
    // User is logged in
    console.log('User is authenticated:', user.email);
    if (userEmail) userEmail.textContent = user.email;
    if (authCheck) authCheck.style.display = 'block';
    if (notAuthorized) notAuthorized.style.display = 'none';
    loadDashboardData();
    loadAllReservations();
    loadEvents();
    loadSettings();
  } else {
    // User is not logged in
    console.log('User is not authenticated');
    if (authCheck) authCheck.style.display = 'none';
    if (notAuthorized) notAuthorized.style.display = 'flex';
  }
});

async function loadDashboardData() {
  try {
    const q = query(collection(db, "reservations"), orderBy("timestamp", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    const tbody = document.getElementById('recentReservationsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let todayCount = 0;
    const today = new Date().toISOString().split('T')[0];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.date === today) todayCount++;

      const row = `
        <tr>
          <td>${escapeHtml(data.name || '')} <br><small style="color:#888">Code: ${escapeHtml(data.code || docSnap.id)}</small></td>
          <td>${escapeHtml(data.date || '')}</td>
          <td>${escapeHtml(data.time || '')}</td>
          <td>${escapeHtml(String(data.guests || ''))}</td>
          <td><span class="status ${escapeHtml((data.status || 'Pending').toLowerCase())}">${escapeHtml(data.status || 'Pending')}</span></td>
        </tr>
      `;
      tbody.innerHTML += row;
    });

    const counter = document.getElementById('todayReservationsCount');
    if (counter) counter.textContent = todayCount;
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('userEmail');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });
}

// Navigation handler
const navLinks = document.querySelectorAll('.admin-nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    // Remove active class from all links
    navLinks.forEach(l => l.classList.remove('active'));

    // Add active class to clicked link
    link.classList.add('active');

    // Show corresponding page
    const page = link.getAttribute('data-page');
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');

    // Load reservations when opening reservations page
    if (page === 'reservations') loadAllReservations();
    // Load events when opening Events page (page key is 'menu')
    if (page === 'menu') loadEvents();
  });
});

// Load all reservations for Reservations page
async function loadAllReservations() {
  try {
    const q = query(collection(db, "reservations"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    const tbody = document.getElementById('reservationsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const statusText = data.status || 'Pending';
      const statusClass = statusText.toLowerCase();

      const row = document.createElement('tr');
      row.setAttribute('data-id', id);

      row.innerHTML = `
        <td>${escapeHtml(data.code || id)}</td>
        <td>${escapeHtml(data.name || '')}</td>
        <td>${escapeHtml(data.email || '')}</td>
        <td>${escapeHtml(data.phone || '')}</td>
        <td>${escapeHtml(data.date || '')}</td>
        <td>${escapeHtml(data.time || '')}</td>
        <td>${escapeHtml(String(data.guests || ''))}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td><button class="action-btn edit-reservation" data-id="${id}">Edit</button></td>
      `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
}

// Events management
async function loadEvents() {
  try {
    const q = query(collection(db, 'events'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const tbody = document.getElementById('eventsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      const row = document.createElement('tr');
      row.setAttribute('data-id', id);
        row.innerHTML = `
          <td>${escapeHtml(data.title || '')}</td>
          <td>${escapeHtml(data.startDate || '')}</td>
          <td>${escapeHtml(data.endDate || '')}</td>
          <td>${data.imageUrl ? `<img src="${escapeHtml(data.imageUrl)}" alt="img" style="height:40px;object-fit:cover;border-radius:4px;"/>` : ''}</td>
          <td>${escapeHtml((data.description || '').substring(0, 120))}</td>
          <td style="white-space:nowrap">
            <button class="action-btn delete-event" data-id="${id}">Delete</button>
          </td>
        `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading events:', err);
  }
}

// Show modal to create a new event
function showEventModal() {
  let modal = document.getElementById('eventModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
      <div style="background:#fff;padding:20px;border-radius:8px;min-width:360px;">
        <h3 style="margin-top:0">Create Event</h3>
        <div style="margin:8px 0"><label>Title</label><input id="eventTitle" style="width:100%;padding:8px;margin-top:6px;"/></div>
        <div style="display:flex;gap:8px;">
          <div style="flex:1;margin:8px 0"><label>Start Date</label><input id="eventStart" type="date" style="width:100%;padding:8px;margin-top:6px;"/></div>
          <div style="flex:1;margin:8px 0"><label>End Date</label><input id="eventEnd" type="date" style="width:100%;padding:8px;margin-top:6px;"/></div>
        </div>
        <div style="margin:8px 0"><label>Photo URL</label><input id="eventImage" placeholder="https://.../photo.jpg" style="width:100%;padding:8px;margin-top:6px;"/></div>
        <div style="margin:8px 0"><label>Description</label><textarea id="eventDesc" style="width:100%;padding:8px;margin-top:6px;" rows="4"></textarea></div>
        <div style="text-align:right;margin-top:12px;">
          <button id="eventCancel" style="margin-right:8px;">Cancel</button>
          <button id="eventSave">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#eventCancel').addEventListener('click', () => modal.remove());
  }

  const saveBtn = modal.querySelector('#eventSave');
  const onSave = async () => {
      const title = modal.querySelector('#eventTitle').value.trim();
      const startDate = modal.querySelector('#eventStart').value;
      const endDate = modal.querySelector('#eventEnd').value;
      const imageUrl = modal.querySelector('#eventImage').value.trim();
      const desc = modal.querySelector('#eventDesc').value.trim();
    if (!title) return alert('Title required');
    try {
        await addDoc(collection(db, 'events'), { title, startDate, endDate, imageUrl, description: desc, timestamp: new Date() });
      modal.remove();
      saveBtn.removeEventListener('click', onSave);
      loadEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event');
    }
  };
  saveBtn.addEventListener('click', onSave);
}

// Delegated delete handler for events
document.addEventListener('click', async (e) => {
  const del = e.target.closest('.delete-event');
  if (!del) return;
  const id = del.getAttribute('data-id');
  if (!confirm('Delete this event?')) return;
  try {
    await deleteDoc(doc(db, 'events', id));
    loadEvents();
  } catch (err) {
    console.error('Error deleting event:', err);
    alert('Failed to delete event');
  }
});

// Utility: simple HTML escape
function escapeHtml(s) {
  if (!s) return '';
  return s.toString().replace(/[&<>"'`]/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`': '&#96;'}[c];
  });
}

// Delegated click handler for edit buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.edit-reservation');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentStatus = row ? (row.querySelector('.status')?.textContent || 'Pending') : 'Pending';
  showStatusModal(id, currentStatus);
});

// Create and show a simple modal to pick status
function showStatusModal(id, currentStatus) {
  let modal = document.getElementById('statusModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'statusModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
      <div style="background:#fff;padding:20px;border-radius:8px;min-width:280px;">
        <h3 style="margin-top:0">Update Reservation Status</h3>
        <div style="margin:8px 0">
          <label for="statusSelect">Status</label>
          <select id="statusSelect" style="width:100%;padding:8px;margin-top:6px;">
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div style="text-align:right;margin-top:12px;">
          <button id="statusCancel" style="margin-right:8px;">Cancel</button>
          <button id="statusSave">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on cancel
    modal.querySelector('#statusCancel').addEventListener('click', () => {
      modal.remove();
    });
  }

  const select = modal.querySelector('#statusSelect');
  select.value = currentStatus;

  // Save handler
  const saveBtn = modal.querySelector('#statusSave');
  const onSave = async () => {
    const newStatus = select.value;
    await updateReservationStatus(id, newStatus);
    modal.remove();
    saveBtn.removeEventListener('click', onSave);
  };
  saveBtn.addEventListener('click', onSave);
}

// Update reservation status in Firestore and UI
async function updateReservationStatus(id, status) {
  try {
    const docRef = doc(db, 'reservations', id);
    await updateDoc(docRef, { status });

    // Update UI row
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      const span = row.querySelector('.status');
      if (span) {
        span.textContent = status;
        span.className = 'status ' + status.toLowerCase();
      }
    }
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Failed to update status. Check console for details.');
  }
}

// Load settings from Firestore and populate form
async function loadSettings() {
  try {
    const settingsDocRef = doc(db, 'settings', 'restaurant');
    const settingsDoc = await getDoc(settingsDocRef);

    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      document.getElementById('settingName').value = data.name || '';
      document.getElementById('settingEmail').value = data.email || '';
      document.getElementById('settingPhone').value = data.phone || '';
      document.getElementById('settingAddress').value = data.address || '';
      document.getElementById('settingHoursMondayThursday').value = data.hoursMondayThursday || '12pm - 11pm';
      document.getElementById('settingHoursFridaySaturday').value = data.hoursFridaySaturday || '12pm - 1am';
      document.getElementById('settingHoursSunday').value = data.hoursSunday || '12pm - 10pm';
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

// Handle settings form submission
async function handleSettingsSubmit(e) {
  e.preventDefault();

  try {
    const name = document.getElementById('settingName').value.trim();
    const email = document.getElementById('settingEmail').value.trim();
    const phone = document.getElementById('settingPhone').value.trim();
    const address = document.getElementById('settingAddress').value.trim();
    const hoursMondayThursday = document.getElementById('settingHoursMondayThursday').value.trim();
    const hoursFridaySaturday = document.getElementById('settingHoursFridaySaturday').value.trim();
    const hoursSunday = document.getElementById('settingHoursSunday').value.trim();

    if (!name || !email || !phone || !address || !hoursMondayThursday || !hoursFridaySaturday || !hoursSunday) {
      alert('Please fill in all settings fields.');
      return;
    }

    const settingsDocRef = doc(db, 'settings', 'restaurant');
    await setDoc(settingsDocRef, {
      name,
      email,
      phone,
      address,
      hoursMondayThursday,
      hoursFridaySaturday,
      hoursSunday,
      timestamp: new Date()
    }, { merge: true });

    alert('Settings saved successfully!');
  } catch (err) {
    console.error('Error saving settings:', err);
    alert('Failed to save settings. Check console for details.');
  }
}

// Wire settings form (if present)
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
  settingsForm.addEventListener('submit', handleSettingsSubmit);
}

// Wire Add Event button (if present)
const addEventBtn = document.getElementById('addEventBtn');
if (addEventBtn) addEventBtn.addEventListener('click', (e) => { e.preventDefault(); showEventModal(); });
