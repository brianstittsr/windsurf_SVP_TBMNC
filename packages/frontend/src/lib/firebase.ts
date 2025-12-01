import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

export const initializeFirebase = async () => {
  if (app) {
    return { app, db, auth, storage };
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      const { connectFirestoreEmulator } = await import('firebase/firestore');
      const { connectAuthEmulator } = await import('firebase/auth');
      const { connectStorageEmulator } = await import('firebase/storage');

      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectStorageEmulator(storage, 'localhost', 9199);

      console.log('🔥 Firebase connected to emulators');
    }

    console.log('🔥 Firebase initialized');
    return { app, db, auth, storage };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

// Initialize immediately (async)
initializeFirebase().then(() => {
  console.log('Firebase ready');
});

// Export getter functions for safe access
export const getDb = () => db;
export const getAuthInstance = () => auth;
export const getStorageInstance = () => storage;

// Export initialized instances (will be undefined until initialized)
export { app, db, auth, storage };
