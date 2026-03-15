"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth"
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { firebaseAuth, firebaseDb, firebaseStorage } from "@/lib/firebase-client"

// Sign up a new user
export const signUp = async (email: string, password: string, displayName: string) => {
  if (!firebaseAuth) throw new Error("Authentication service is unavailable. Please refresh and try again.")

  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)

    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName })

      // Create user document in Firestore
      if (firebaseDb) {
        const uid = userCredential.user.uid
        await setDoc(doc(firebaseDb, "users", uid), {
          uid,
          email: userCredential.user.email,
          displayName,
          createdAt: new Date().toISOString(),
        })

        // Auto-create a default workspace so the user can immediately create posts
        try {
          const { addDoc, collection: firestoreCollection } = await import("firebase/firestore")
          const workspacesRef = firestoreCollection(firebaseDb, "workspaces")
          const workspaceRef = await addDoc(workspacesRef, {
            name: "My Workspace",
            ownerId: uid,
            memberIds: [uid],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accounts: {}
          })
          // Set as active workspace
          await setDoc(doc(firebaseDb, "users", uid), { activeWorkspaceId: workspaceRef.id }, { merge: true })
          console.log("signUp: Created default workspace", workspaceRef.id, "for user", uid)
        } catch (wsErr) {
          // Non-fatal: workspace will be auto-created on first post attempt
          console.warn("signUp: Could not create default workspace, will retry on first post:", wsErr)
        }
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
  if (!firebaseAuth) throw new Error("Authentication service is unavailable. Please refresh and try again.")

  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return { user: userCredential.user }
  } catch (error: any) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!firebaseAuth) throw new Error("Authentication service is unavailable. Please refresh and try again.")

  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(firebaseAuth, provider)
    
    if (userCredential.user) {
      const uid = userCredential.user.uid
      const userDocRef = doc(firebaseDb!, "users", uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // First time user - create document and workspace
        await setDoc(userDocRef, {
          uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString(),
        })

        // Create default workspace
        try {
          const { addDoc, collection: firestoreCollection } = await import("firebase/firestore")
          const workspacesRef = firestoreCollection(firebaseDb!, "workspaces")
          const workspaceRef = await addDoc(workspacesRef, {
            name: "My Workspace",
            ownerId: uid,
            memberIds: [uid],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accounts: {}
          })
          // Set as active workspace
          await setDoc(userDocRef, { activeWorkspaceId: workspaceRef.id }, { merge: true })
          console.log("signInWithGoogle: Created default workspace", workspaceRef.id, "for user", uid)
        } catch (wsErr) {
          console.warn("signInWithGoogle: Could not create default workspace:", wsErr)
        }
      }
    }

    return { user: userCredential.user }
  } catch (error: any) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

// Sign out the current user
export const signOut = async () => {
  if (!firebaseAuth) throw new Error("Authentication service is unavailable. Please refresh and try again.")

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
  const auth = firebaseAuth

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!firebaseAuth) return () => { }

  return onAuthStateChanged(firebaseAuth!, callback)
}

export const updateUserProfile = async (data: { displayName?: string; photoURL?: string; niche?: string; trendCompetitors?: string[] }) => {
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

// Onboarding Tour functions
export const checkTourStatus = async (): Promise<boolean> => {
  if (!firebaseAuth || !firebaseAuth.currentUser || !firebaseDb) return true

  try {
    const userDocRef = doc(firebaseDb, "users", firebaseAuth.currentUser.uid)
    const userDoc = await getDoc(userDocRef)
    
    // If it's the first time/no field, they haven't completed it
    const data = userDoc.data()
    return data?.hasCompletedTour === true
  } catch (error) {
    console.error("Error checking tour status:", error)
    return true // Assume completed on error to avoid blocking UX
  }
}

export const completeTour = async () => {
  if (!firebaseAuth || !firebaseAuth.currentUser || !firebaseDb) return

  try {
    const userDocRef = doc(firebaseDb, "users", firebaseAuth.currentUser.uid)
    await updateDoc(userDocRef, {
      hasCompletedTour: true,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error completing tour:", error)
  }
}
