// lib/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { config } from "../config"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
}

import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"
import type { FirebaseStorage } from "firebase/storage"
import type { FirebaseApp } from "firebase/app"

interface FirebaseServices {
  app: FirebaseApp | null
  auth: Auth | null
  db: Firestore | null
  storage: FirebaseStorage | null
}

// Initialize Firebase for client-side only
const firebase: FirebaseServices = { app: null, auth: null, db: null, storage: null }

if (typeof window !== "undefined") {
  // Initialize Firebase
  firebase.app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

  // Initialize Firebase services
  firebase.auth = getAuth(firebase.app)
  firebase.db = getFirestore(firebase.app)
  firebase.storage = getStorage(firebase.app)
}

// Export the initialized services
export const app = firebase.app
export const auth = firebase.auth
export const db = firebase.db
export const storage = firebase.storage
