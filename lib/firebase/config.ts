// lib/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8",
  authDomain: "socialmedia-scheduler-eb22f.firebaseapp.com",
  projectId: "socialmedia-scheduler-eb22f",
  storageBucket: "socialmedia-scheduler-eb22f.firebasestorage.app",
  messagingSenderId: "974176191059",
  appId: "1:974176191059:web:4b29d837e57c00a97abca6",
}

// Initialize Firebase for client-side only
const firebase = { app: null, auth: null, db: null, storage: null }

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
