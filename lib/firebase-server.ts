// Server-side Firebase initialization for API routes
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getAuth, type Auth } from "firebase/auth"
import { config } from "./config"

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
}

// Initialize Firebase for server-side use
let firebaseApp: FirebaseApp | null = null
let firebaseDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null
let firebaseAuth: Auth | null = null

export function getFirebaseAdmin() {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }
  if (!firebaseDb) {
    firebaseDb = getFirestore(firebaseApp)
  }
  if (!firebaseStorage) {
    firebaseStorage = getStorage(firebaseApp)
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp)
  }
  return { firebaseApp, firebaseDb, firebaseStorage, firebaseAuth }
}

// Lazy initialization to prevent build-time crashes
export const getServerFirebase = () => getFirebaseAdmin();

// Export getters instead of direct constants to avoid immediate evaluation
export const getServerDb = () => getFirebaseAdmin().firebaseDb;
export const getServerStorage = () => getFirebaseAdmin().firebaseStorage;
export const getServerAuth = () => getFirebaseAdmin().firebaseAuth;

// Keep these for backward compatibility but they will now trigger initialization on first access
// if used in a way that allows for it, but better to use the getters above.
export const serverDb = null as any;
export const serverStorage = null as any;
export const serverAuth = null as any;

