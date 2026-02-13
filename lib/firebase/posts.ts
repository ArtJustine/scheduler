import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { PostType } from "@/types/post"
import { getActiveWorkspace } from "./workspaces"

// Remove all mock data and preview mode logic. Only use real Firestore data for all post functions.

// Helper function to check if Firestore is available
const isFirestoreAvailable = () => {
  return typeof window !== "undefined" && firebaseDb !== undefined
}

export async function getScheduledPosts(userId?: string) {
  if (!isFirestoreAvailable()) return []

  const uid = userId || firebaseAuth?.currentUser?.uid
  if (!uid) {
    console.log("getScheduledPosts: No userId provided or found on auth")
    return []
  }

  try {
    console.log("getScheduledPosts: Fetching for user", uid)

    // Get active workspace to filter posts
    const workspace = await getActiveWorkspace(uid)
    if (!workspace) return []

    const postsRef = collection(firebaseDb!, "posts")
    const q = query(postsRef, where("workspaceId", "==", workspace.id))
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
    return []
  }
}

export async function getPost(postId: string) {
  if (!isFirestoreAvailable()) return null

  try {
    const postRef = doc(firebaseDb!, "posts", postId)
    const postDoc = await getDoc(postRef)

    if (!postDoc.exists()) return null

    const postData = postDoc.data()
    return {
      id: postDoc.id,
      ...postData,
    } as PostType
  } catch (error: any) {
    console.error("Error getting post by ID:", error)
    return null
  }
}

export async function createPost(postData: Omit<PostType, "id" | "createdAt" | "updatedAt" | "userId">) {
  if (!isFirestoreAvailable()) throw new Error("Firestore is not available")

  const user = firebaseAuth?.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const workspace = await getActiveWorkspace(user.uid)
    if (!workspace) throw new Error("No active workspace found")

    const postsRef = collection(firebaseDb!, "posts")
    const newPost = {
      ...postData,
      userId: user.uid,
      workspaceId: workspace.id,
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
