import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, db, storage } from "./config"

export async function signUp(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Update profile with display name
  await firebaseUpdateProfile(user, { displayName })

  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    createdAt: new Date().toISOString(),
  })

  return user
}

export async function signIn(email: string, password: string) {
  const userCredential = await firebaseSignIn(auth, email, password)
  return userCredential.user
}

export async function signOut() {
  return firebaseSignOut(auth)
}

export async function updateUserProfile(profileData: { displayName?: string; photoURL?: string }) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("No authenticated user")
  }

  await firebaseUpdateProfile(user, profileData)

  // Update user document in Firestore
  await setDoc(
    doc(db, "users", user.uid),
    {
      ...profileData,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )

  return user
}

export async function updateUserAvatar(file: File) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("No authenticated user")
  }

  // Upload image to Firebase Storage
  const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`)
  await uploadBytes(storageRef, file)

  // Get download URL
  const photoURL = await getDownloadURL(storageRef)

  // Update user profile
  await updateUserProfile({ photoURL })

  return photoURL
}

export async function getUserProfile() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("No authenticated user")
  }

  const userDoc = await getDoc(doc(db, "users", user.uid))

  if (!userDoc.exists()) {
    throw new Error("User document not found")
  }

  return userDoc.data()
}
