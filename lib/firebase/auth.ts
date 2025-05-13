"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { firebaseAuth, firebaseDb, firebaseStorage } from "../firebase-client"

// Sign up a new user
export const signUp = async (email: string, password: string, displayName: string) => {
  if (!firebaseAuth) throw new Error("Auth is not initialized")

  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)

    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName })

      // Create user document in Firestore
      if (firebaseDb) {
        await setDoc(doc(firebaseDb, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName,
          createdAt: new Date().toISOString(),
        })
      }
    }

    return { user: userCredential.user }
  } catch (error: any) {
    console.error("Error signing up:", error)
    throw error
  }
}

// Sign in an existing user
export const signIn = async (email: string, password: string) => {
  if (!firebaseAuth) throw new Error("Auth is not initialized")

  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return { user: userCredential.user }
  } catch (error: any) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out the current user
export const signOut = async () => {
  if (!firebaseAuth) throw new Error("Auth is not initialized")

  try {
    await firebaseSignOut(firebaseAuth)
    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get the current user
export const getCurrentUser = (): Promise<User | null> => {
  if (!firebaseAuth) return Promise.resolve(null)

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!firebaseAuth) return () => {}

  return onAuthStateChanged(firebaseAuth, callback)
}

export const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
  if (!firebaseAuth || !firebaseAuth.currentUser) {
    throw new Error("User not authenticated")
  }

  try {
    await updateProfile(firebaseAuth.currentUser, data)

    // Update user document in Firestore
    if (firebaseDb) {
      const userDocRef = doc(firebaseDb, "users", firebaseAuth.currentUser.uid)
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export const updateUserAvatar = async (file: File): Promise<string> => {
  if (!firebaseAuth || !firebaseAuth.currentUser || !firebaseStorage) {
    throw new Error("User not authenticated or storage not initialized")
  }

  try {
    const storageRef = ref(firebaseStorage, `avatars/${firebaseAuth.currentUser.uid}/${file.name}`)
    await uploadBytes(storageRef, file)
    const photoURL = await getDownloadURL(storageRef)

    await updateProfile(firebaseAuth.currentUser, { photoURL })

    // Update user document in Firestore
    if (firebaseDb) {
      const userDocRef = doc(firebaseDb, "users", firebaseAuth.currentUser.uid)
      await updateDoc(userDocRef, {
        photoURL,
        updatedAt: new Date().toISOString(),
      })
    }

    return photoURL
  } catch (error: any) {
    console.error("Error updating avatar:", error)
    throw error
  }
}

export const getUserProfile = async () => {
  if (!firebaseAuth || !firebaseAuth.currentUser || !firebaseDb) {
    throw new Error("User not authenticated or database not initialized")
  }

  try {
    const userDocRef = doc(firebaseDb, "users", firebaseAuth.currentUser.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      const userData = {
        uid: firebaseAuth.currentUser.uid,
        email: firebaseAuth.currentUser.email,
        displayName: firebaseAuth.currentUser.displayName,
        photoURL: firebaseAuth.currentUser.photoURL,
        createdAt: new Date().toISOString(),
      }

      await setDoc(userDocRef, userData)
      return userData
    }

    return userDoc.data()
  } catch (error: any) {
    console.error("Error getting user profile:", error)
    throw error
  }
}
