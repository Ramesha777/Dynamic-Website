// Firebase App (the core Firebase SDK) - using Firebase v9
import { firebaseConfig } from '../Backend/firebaseconfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export functions for use in other files
window.firebaseAuth = auth;
window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseOnAuthStateChanged = onAuthStateChanged;
window.db = db;
window.collection = collection;
window.addDoc = addDoc;
