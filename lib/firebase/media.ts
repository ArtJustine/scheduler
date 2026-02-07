import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, orderBy } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { firebaseDb as db, firebaseStorage as storage, firebaseAuth as auth } from "@/lib/firebase-client"
import type { MediaItem } from "@/types/media"

interface UploadMediaParams {
  file: File
  title: string
  type: "image" | "video"
}

export async function uploadMediaToLibrary({ file, title, type }: UploadMediaParams) {
  if (!auth || !storage || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `media/${user.uid}/${fileName}`)

    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)

    const mediaData = {
      userId: user.uid,
      url: downloadURL,
      title,
      type,
      fileName: file.name,
      fileSize: file.size,
      storagePath: storageRef.fullPath,
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, "media"), mediaData)
    return { id: docRef.id, ...mediaData } as MediaItem
  } catch (error) {
    console.error("Error uploading to library:", error)
    throw error
  }
}

export async function registerMediaMetadata(data: Omit<MediaItem, "id" | "userId" | "createdAt">) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser
  if (!user) {
    console.warn("registerMediaMetadata: No authenticated user found")
    throw new Error("User not authenticated")
  }

  try {
    const mediaData = {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, "media"), mediaData)
    return { id: docRef.id, ...mediaData } as MediaItem
  } catch (error) {
    console.error("Error registering media metadata:", error)
    throw error
  }
}

export async function getMediaLibrary(userId?: string) {
  if (!auth || !db) throw new Error("Firebase not initialized")

  const uid = userId || auth.currentUser?.uid
  if (!uid) {
    console.log("getMediaLibrary: No userId provided or found on auth")
    return []
  }

  try {
    console.log("getMediaLibrary: Fetching for user", uid)
    const mediaQuery = query(
      collection(db, "media"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    )

    console.log("getMediaLibrary: Executing query...")
    const snapshot = await getDocs(mediaQuery)
    console.log(`getMediaLibrary: Found ${snapshot.size} items`)

    const items = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
      } as MediaItem
    })

    return items
  } catch (error) {
    console.error("Error fetching media library:", error)
    return []
  }
}

export async function deleteMediaFromLibrary(id: string) {
  if (!auth || !db || !storage) throw new Error("Firebase not initialized")

  try {
    const docRef = doc(db, "media", id)
    const docSnap = await getDocs(query(collection(db, "media"), where("__name__", "==", id)))

    if (docSnap.empty) throw new Error("Media item not found")

    const mediaData = docSnap.docs[0].data() as MediaItem

    // Delete from Storage if storagePath exists
    if (mediaData.storagePath) {
      try {
        const storageRef = ref(storage, mediaData.storagePath)
        await deleteObject(storageRef)
      } catch (storageError) {
        console.warn("Error deleting from Storage (might be missing):", storageError)
      }
    }

    // Delete from Firestore
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error deleting media:", error)
    throw error
  }
}
