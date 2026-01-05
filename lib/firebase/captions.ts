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
import type { CaptionTemplate } from "@/types/caption"

interface CreateCaptionTemplateParams {
  title: string
  content: string
}

export async function createCaptionTemplate({ title, content }: CreateCaptionTemplateParams) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const captionData = {
    userId: user.uid,
    title,
    content,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "captionTemplates"), captionData)

  return {
    id: docRef.id,
    ...captionData,
    createdAt: captionData.createdAt.toDate().toISOString(),
    updatedAt: captionData.updatedAt.toDate().toISOString(),
  } as CaptionTemplate
}

export async function getCaptionTemplates() {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const captionQuery = query(
    collection(db, "captionTemplates"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
  )

  const snapshot = await getDocs(captionQuery)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
    updatedAt: doc.data().updatedAt.toDate().toISOString(),
  })) as CaptionTemplate[]
}

export async function updateCaptionTemplate(templateId: string, data: Partial<CaptionTemplate>) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  }

  await updateDoc(doc(db, "captionTemplates", templateId), updateData)
}

export async function deleteCaptionTemplate(templateId: string) {
  if (!auth || !db) throw new Error("Firebase not initialized")
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  await deleteDoc(doc(db, "captionTemplates", templateId))
}
