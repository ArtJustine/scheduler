import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage, auth } from "./config"
import type { MediaItem } from "@/types/media"

interface UploadMediaParams {
  file: File
  title: string
  type: "image" | "video"
}

export async function uploadMediaToLibrary({ file, title, type }: UploadMediaParams) {
  if (!auth || !db || !storage) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Upload file to Firebase Storage
  const storageRef = ref(storage, `media/${user.uid}/${Date.now()}_${file.name}`)
  await uploadBytes(storageRef, file)

  // Get download URL
  const url = await getDownloadURL(storageRef)

  return await registerMediaMetadata({
    url,
    title,
    type,
    fileName: file.name,
    fileSize: file.size,
    storagePath: storageRef.fullPath,
  })
}

export async function registerMediaMetadata(data: {
  url: string
  title: string
  type: "image" | "video"
  fileName: string
  fileSize: number
  storagePath: string
}) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const mediaData = {
    userId: user.uid,
    ...data,
    createdAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "media"), mediaData)

  return {
    id: docRef.id,
    ...mediaData,
    createdAt: mediaData.createdAt.toDate().toISOString(),
  } as MediaItem
}

export async function getMediaLibrary() {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const mediaQuery = query(collection(db, "media"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(mediaQuery)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  })) as MediaItem[]
}

export async function deleteMediaFromLibrary(mediaId: string) {
  if (!auth || !db || !storage) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get the media document to find the storage path
  const mediaDoc = await doc(db, "media", mediaId)
  const mediaSnapshot = await getDocs(query(collection(db, "media"), where("__name__", "==", mediaId)))

  if (mediaSnapshot.empty) {
    throw new Error("Media not found")
  }

  const mediaData = mediaSnapshot.docs[0].data()

  // Verify ownership
  if (mediaData.userId !== user.uid) {
    throw new Error("Unauthorized access to media")
  }

  // Delete from storage if path exists
  if (mediaData.storagePath) {
    const storageRef = ref(storage, mediaData.storagePath)
    await deleteObject(storageRef)
  }

  // Delete from Firestore
  await deleteDoc(doc(db, "media", mediaId))
}
