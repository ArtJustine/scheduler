"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage"

import { config } from "./config"

// Use configuration from the central config file
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

// Initialize Firebase only on the client side
let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firebaseDb: Firestore | undefined
let firebaseStorage: FirebaseStorage | undefined

if (typeof window !== "undefined") {
  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig)
    } else {
      firebaseApp = getApps()[0]
    }

    firebaseAuth = getAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)
    firebaseStorage = getStorage(firebaseApp)

    // Enable offline persistence for Firestore
    if (firebaseDb) {
      enableIndexedDbPersistence(firebaseDb).catch((err) => {
        if (err.code === "failed-precondition") {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn("Firestore persistence failed: Multiple tabs open")
        } else if (err.code === "unimplemented") {
          // The current browser does not support all of the features required for persistence
          console.warn("Firestore persistence is not available in this browser")
        } else {
          console.error("Firestore persistence error:", err)
        }
      })
    }

    // Use emulators in development
    if (process.env.NODE_ENV === "development") {
      // Uncomment these lines to use Firebase emulators
      // connectAuthEmulator(firebaseAuth, "http://localhost:9099")
      // connectFirestoreEmulator(firebaseDb, "localhost", 8080)
      // connectStorageEmulator(firebaseStorage, "localhost", 9199)
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

export { firebaseApp, firebaseAuth, firebaseDb, firebaseStorage }
