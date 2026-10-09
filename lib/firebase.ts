// lib/firebase.ts
// Firebase Client SDK - used in browser (login, register pages)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC9dwThr6FjGpwsnob1vmYprp-8c2b_L2U',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'legal-ai-writer.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'legal-ai-writer',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'legal-ai-writer.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '713907791844',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:713907791844:web:200db7dcff52fa334c09f1',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-2B4E0CT4QX',
};

// Safe initialization supporting Next.js static prerendering
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Analytics only runs in browser
export const initAnalytics = async () => {
  if (typeof window !== 'undefined') {
    const { isSupported, getAnalytics } = await import('firebase/analytics');
    if (await isSupported()) {
      return getAnalytics(app);
    }
  }
  return null;
};

export default app;
