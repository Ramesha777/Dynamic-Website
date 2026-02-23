// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmMiNxGfMqLuAQj9-8eSi52pcDOkZqzKE",
  authDomain: "whitmore-e55a0.firebaseapp.com",
  projectId: "whitmore-e55a0",
  storageBucket: "whitmore-e55a0.firebasestorage.app",
  messagingSenderId: "655337198270",
  appId: "1:655337198270:web:5aa32a2d2a6a0f73f344ef"
};

// Initialize Firebase
function initializeFirebase() {
  if (typeof firebase !== 'undefined' && firebase && !firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return typeof firebase !== 'undefined' ? window.firebase : null;
}

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;

// ES module named export for modern modules to import
export { firebaseConfig };
