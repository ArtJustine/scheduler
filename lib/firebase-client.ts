import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

import type { FirebaseApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"
import type { FirebaseStorage } from "firebase/storage"

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firebaseDb: Firestore | undefined
let firebaseStorage: FirebaseStorage | undefined

if (typeof window !== "undefined") {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase API Key is missing. Check your environment variables.")
    } else {
      if (!getApps().length) {
        firebaseApp = initializeApp(firebaseConfig)
      } else {
        firebaseApp = getApp()
      }

      firebaseAuth = getAuth(firebaseApp)
      // Use initializeFirestore to enable ignoreUndefinedProperties
      // This prevents the "Unsupported field value: undefined" error globally
      firebaseDb = initializeFirestore(firebaseApp!, { ignoreUndefinedProperties: true })
      firebaseStorage = getStorage(firebaseApp)

      if (firebaseDb) {
        enableIndexedDbPersistence(firebaseDb).catch((err) => {
          if (err.code === "failed-precondition") {
            console.warn("Firestore persistence failed: Multiple tabs open")
          } else if (err.code === "unimplemented") {
            console.warn("Firestore persistence is not available in this browser")
          } else {
            console.error("Firestore persistence error:", err)
          }
        })
      }
    }
  } catch (err) {
    console.error("Firebase initialization failed:", err)
  }
}

export { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage }
