import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { PostType } from "@/types/post"

// Remove all mock data and preview mode logic. Only use real Firestore data for all post functions.

// Helper function to check if Firestore is available
const isFirestoreAvailable = () => {
  return typeof window !== "undefined" && firebaseDb !== undefined
}

export async function getScheduledPosts() {
  // Check if we're in the browser and Firestore is available
  if (!isFirestoreAvailable()) {
    console.warn("Firestore is not available, cannot get scheduled posts")
    return []
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    console.warn("User not authenticated, cannot get scheduled posts")
    return []
  }

  try {
    const postsRef = collection(firebaseDb!, "posts")
    const q = query(postsRef, where("userId", "==", user.uid))
    const querySnapshot = await getDocs(q)

    const posts: PostType[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        ...data,
        scheduledFor: data.scheduledFor && typeof data.scheduledFor === 'object' && 'toDate' in data.scheduledFor
          ? data.scheduledFor.toDate().toISOString()
          : data.scheduledFor || new Date().toISOString(),
        createdAt: data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
      } as PostType)
    })

    // Sort by scheduled date
    return posts.sort((a, b) => {
      try {
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      } catch (e) {
        return 0
      }
    })
  } catch (error: any) {
    console.error("Error getting scheduled posts:", error)

    // If we get an offline error, return empty array as fallback
    if (error.message?.includes("offline")) {
      console.log("Client is offline, cannot get scheduled posts")
      return []
    }

    return []
  }
}

export async function getPost(postId: string) {
  // Check if we're in the browser and Firestore is available
  if (!isFirestoreAvailable()) {
    console.warn("Firestore is not available, cannot get post by ID")
    return null
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    console.warn("User not authenticated, cannot get post by ID")
    return null
  }

  try {
    const postRef = doc(firebaseDb!, "posts", postId)
    const postDoc = await getDoc(postRef)

    if (!postDoc.exists()) {
      return null
    }

    const postData = postDoc.data()

    // Verify the post belongs to the current user
    if (postData.userId !== user.uid) {
      console.warn("Unauthorized access to post")
      return null
    }

    return {
      id: postDoc.id,
      ...postData,
    } as PostType
  } catch (error: any) {
    console.error("Error getting post by ID:", error)

    // If we get an offline error, return null as fallback
    if (error.message?.includes("offline")) {
      console.log("Client is offline, cannot get post by ID")
      return null
    }

    return null
  }
}

export async function createPost(postData: Omit<PostType, "id" | "createdAt" | "updatedAt" | "userId">) {
  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const postsRef = collection(firebaseDb!, "posts")
    const newPost = {
      ...postData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await addDoc(postsRef, newPost)
    return docRef.id
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export async function updatePost(postId: string, postData: Partial<PostType>) {
  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const postRef = doc(firebaseDb!, "posts", postId)
    const postDoc = await getDoc(postRef)

    if (!postDoc.exists()) {
      throw new Error("Post not found")
    }

    const existingPost = postDoc.data()

    // Verify the post belongs to the current user
    if (existingPost.userId !== user.uid) {
      throw new Error("Unauthorized access to post")
    }

    await updateDoc(postRef, {
      ...postData,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

export async function deletePost(postId: string) {
  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const postRef = doc(firebaseDb!, "posts", postId)
    const postDoc = await getDoc(postRef)

    if (!postDoc.exists()) {
      throw new Error("Post not found")
    }

    const existingPost = postDoc.data()

    // Verify the post belongs to the current user
    if (existingPost.userId !== user.uid) {
      throw new Error("Unauthorized access to post")
    }

    await deleteDoc(postRef)
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}
