import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration using project ID
const firebaseConfig = {
  apiKey: "AIzaSyD8EVamhIlHkc1IzbHhb3LAZP6NwbLsMOo",
  authDomain: "myfirst-386de.firebaseapp.com",
  projectId: "myfirst-386de",
  storageBucket: "myfirst-386de.firebasestorage.app",
  messagingSenderId: "562686591984",
  appId: "1:562686591984:android:4d9a7196c9f4f032c95335",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Authentication with persistent storage
// Use a try-catch to handle hot-reload scenarios in development
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // Fallback for when auth is already initialized during hot reload
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

export { db, storage, auth };
export default app;