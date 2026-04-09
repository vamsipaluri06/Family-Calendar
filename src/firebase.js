import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// Replace these with your Firebase project credentials
// Get them from: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app = null;
let db = null;

// Only initialize Firebase if config is provided
if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('Firebase connected successfully');
  } catch (error) {
    console.warn('Firebase initialization failed, using localStorage:', error.message);
  }
} else {
  console.log('Firebase not configured, using localStorage for data persistence');
}

export { db };
