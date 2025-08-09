"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Your web app's Firebase configuration (must be provided via env)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only on the client side, lazily when needed
let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let firebaseDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null

export function initializeFirebaseIfNeeded() {
  if (typeof window === "undefined") {
    return { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage }
  }
  try {
    if (!firebaseApp) {
      firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    }
    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp)
    }
    if (!firebaseDb) {
      firebaseDb = getFirestore(firebaseApp)
      enableIndexedDbPersistence(firebaseDb).catch((err: any) => {
        if (err.code === "failed-precondition") {
          console.warn("Firestore persistence failed: Multiple tabs open")
        } else if (err.code === "unimplemented") {
          console.warn("Firestore persistence is not available in this browser")
        } else {
          console.error("Firestore persistence error:", err)
        }
      })
    }
    if (!firebaseStorage) {
      firebaseStorage = getStorage(firebaseApp)
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
  return { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage }
}

// Eagerly initialize in browser so auth is ready before first call
if (typeof window !== "undefined") {
  initializeFirebaseIfNeeded()
}

export { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage }
