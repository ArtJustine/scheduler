import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore"
import { db, auth } from "./config"
import type { HashtagGroup } from "@/types/hashtag"

interface CreateHashtagGroupParams {
  name: string
  hashtags: string[]
}

export async function createHashtagGroup({ name, hashtags }: CreateHashtagGroupParams) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const hashtagData = {
    userId: user.uid,
    name,
    hashtags,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "hashtagGroups"), hashtagData)

  return {
    id: docRef.id,
    ...hashtagData,
    createdAt: hashtagData.createdAt.toDate().toISOString(),
    updatedAt: hashtagData.updatedAt.toDate().toISOString(),
  } as HashtagGroup
}

export async function getHashtagGroups(userId?: string) {
  if (!auth || !db) throw new Error("Firebase not initialized")

  const uid = userId || auth.currentUser?.uid
  if (!uid) {
    console.log("getHashtagGroups: No userId provided or found on auth")
    return []
  }

  try {
    console.log("getHashtagGroups: Fetching for user", uid)
    const hashtagQuery = query(
      collection(db, "hashtagGroups"),
      where("userId", "==", uid),
      orderBy("createdAt", "asc"),
    )

    const snapshot = await getDocs(hashtagQuery)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
    })) as HashtagGroup[]
  } catch (error) {
    console.error("Error fetching hashtag groups:", error)
    return []
  }
}

export async function updateHashtagGroup(groupId: string, data: Partial<HashtagGroup>) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  }

  await updateDoc(doc(db, "hashtagGroups", groupId), updateData)
}

export async function deleteHashtagGroup(groupId: string) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  await deleteDoc(doc(db, "hashtagGroups", groupId))
}
