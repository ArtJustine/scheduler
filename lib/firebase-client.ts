import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { config } from "./config"

// Your web app's Firebase configuration from centralized config
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
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
      console.warn("Firebase API Key is missing. Please check your environment variables (NEXT_PUBLIC_FIREBASE_API_KEY). Authentication and database features will be limited.")
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

