import { auth, db } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isMember: boolean;
  loading: boolean;
}

let currentAuthState: AuthState = {
  user: null,
  isAdmin: false,
  isMember: false,
  loading: true
};

const listeners: Array<(state: AuthState) => void> = [];

export function getAuthState(): AuthState {
  return currentAuthState;
}

export function subscribeAuthState(callback: (state: AuthState) => void): () => void {
  listeners.push(callback);
  callback(currentAuthState);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notify() {
  listeners.forEach(cb => cb(currentAuthState));
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Observe Firebase Auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentAuthState = {
      user: null,
      isAdmin: false,
      isMember: false,
      loading: false
    };
    notify();
    return;
  }

  const initialAdmin = import.meta.env.VITE_INITIAL_ADMIN_EMAIL || 'poopo7096@gmail.com';
  const email = user.email || '';
  let isAdmin = email.toLowerCase() === initialAdmin.toLowerCase();
  let isMember = isAdmin;

  try {
    const memberDoc = await getDoc(doc(db, 'members', email));
    if (memberDoc.exists()) {
      const data = memberDoc.data();
      isMember = true;
      if (data.role === 'admin') isAdmin = true;
    } else if (isAdmin) {
      // Auto-provision initial admin member doc
      await setDoc(doc(db, 'members', email), {
        email,
        name: user.displayName || 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      isMember = true;
    }
  } catch (err) {
    console.warn('[Auth] Checking member collection failed or offline:', err);
    // If user is initial admin, keep admin privileges
  }

  currentAuthState = {
    user,
    isAdmin,
    isMember,
    loading: false
  };
  notify();
});
