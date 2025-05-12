import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8",
  authDomain: "socialmedia-scheduler-eb22f.firebaseapp.com",
  projectId: "socialmedia-scheduler-eb22f",
  storageBucket: "socialmedia-scheduler-eb22f.firebasestorage.app",
  messagingSenderId: "974176191059",
  appId: "1:974176191059:web:4b29d837e57c00a97abca6",
}

// Initialize Firebase
let app, auth, db, storage

// Check if we're running on the client side
if (typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
} else {
  // SSR placeholder objects
  app = {} as any
  auth = {} as any
  db = {} as any
  storage = {} as any
}

export { app, auth, db, storage }
