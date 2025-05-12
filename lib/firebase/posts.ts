import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage, auth } from "./config"
import type { PostType } from "@/types/post"

interface CreatePostParams {
  title: string
  description?: string
  platform: string
  contentType: string
  scheduledFor: Date
  media: File | null
}

export async function createPost({ title, description, platform, contentType, scheduledFor, media }: CreatePostParams) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  let mediaUrl = null

  // Upload media if provided
  if (media) {
    const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${media.name}`)
    await uploadBytes(storageRef, media)
    mediaUrl = await getDownloadURL(storageRef)
  }

  // Create post document
  const postData = {
    userId: user.uid,
    title,
    description: description || "",
    platform,
    contentType,
    scheduledFor: Timestamp.fromDate(scheduledFor),
    mediaUrl,
    status: "scheduled",
    createdAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "posts"), postData)

  return {
    id: docRef.id,
    ...postData,
  }
}

export async function getScheduledPosts(): Promise<PostType[]> {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const postsQuery = query(collection(db, "posts"), where("userId", "==", user.uid), orderBy("scheduledFor", "asc"))

  const snapshot = await getDocs(postsQuery)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    scheduledFor: doc.data().scheduledFor.toDate().toISOString(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  })) as PostType[]
}

export async function getPost(postId: string): Promise<PostType | null> {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const docRef = doc(db, "posts", postId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const data = docSnap.data()

  // Verify the post belongs to the current user
  if (data.userId !== user.uid) {
    throw new Error("Unauthorized access to post")
  }

  return {
    id: docSnap.id,
    ...data,
    scheduledFor: data.scheduledFor.toDate().toISOString(),
    createdAt: data.createdAt.toDate().toISOString(),
  } as PostType
}

export async function deletePost(postId: string) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Verify ownership before deleting
  const post = await getPost(postId)
  if (!post || post.userId !== user.uid) {
    throw new Error("Unauthorized access to post")
  }

  await deleteDoc(doc(db, "posts", postId))
}

export async function updatePost(postId: string, data: Partial<PostType>) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Verify ownership before updating
  const post = await getPost(postId)
  if (!post || post.userId !== user.uid) {
    throw new Error("Unauthorized access to post")
  }

  // Convert Date objects to Firestore Timestamps
  const firestoreData: any = { ...data }
  if (data.scheduledFor) {
    firestoreData.scheduledFor = Timestamp.fromDate(new Date(data.scheduledFor))
  }

  await updateDoc(doc(db, "posts", postId), firestoreData)
}
