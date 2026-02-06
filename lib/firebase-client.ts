import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8",
  authDomain: "socialmedia-scheduler-eb22f.firebaseapp.com",
  projectId: "socialmedia-scheduler-eb22f",
  storageBucket: "socialmedia-scheduler-eb22f.firebasestorage.app",
  messagingSenderId: "974176191059",
  appId: "1:974176191059:web:4b29d837e57c00a97abca6",
}

import type { FirebaseApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"
import type { FirebaseStorage } from "firebase/storage"

// Initialize Firebase
let firebaseApp: FirebaseApp
let firebaseAuth: Auth
let firebaseDb: Firestore
let firebaseStorage: FirebaseStorage

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApps()[0]
}

firebaseAuth = getAuth(firebaseApp)
firebaseDb = getFirestore(firebaseApp)
firebaseStorage = getStorage(firebaseApp)

// Enable offline persistence ONLY on the client side
if (typeof window !== "undefined" && firebaseDb) {
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

export { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage }
