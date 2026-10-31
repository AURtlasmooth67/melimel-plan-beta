import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAiK0gVN6r-FWBPQZfjoA8m9Awq9CVHTZA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kalabro-testdeploy.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kalabro-testdeploy',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kalabro-testdeploy.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '429618972963',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:429618972963:web:07534370a1f45c60a7e496'
};

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Use Emulators in dev mode if explicitly configured
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.info('[Firebase] Connected to local Emulators');
  } catch (err) {
    console.warn('[Firebase] Emulator connection skipped or already initialized', err);
  }
}
