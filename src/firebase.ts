import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test Firebase connection
console.log('🔥 Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

// Test Firestore connectivity
import { connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

// Add connection state monitoring
let isFirebaseConnected = true;

export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    await enableNetwork(db);
    isFirebaseConnected = true;
    console.log('🟢 Firebase connection: Online');
    return true;
  } catch (error) {
    console.warn('🔴 Firebase connection: Offline or blocked', error);
    isFirebaseConnected = false;
    return false;
  }
};

export const getFirebaseConnectionStatus = (): boolean => {
  return isFirebaseConnected;
};

// Initialize connection check
checkFirebaseConnection();

export default app;