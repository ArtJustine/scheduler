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
    let workspace = await getActiveWorkspace(uid)
    if (!workspace) {
      // Auto-create a default workspace for new users
      const { createWorkspace } = await import("./workspaces")
      await createWorkspace(uid, "My Workspace")
      workspace = await getActiveWorkspace(uid)
    }
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
    let workspace = await getActiveWorkspace(user.uid)

    // Auto-create a default workspace for new users who don't have one yet
    if (!workspace) {
      console.log("createPost: No workspace found, creating default workspace for user", user.uid)
      const { createWorkspace } = await import("./workspaces")
      const workspaceId = await createWorkspace(user.uid, "My Workspace")
      workspace = await getActiveWorkspace(user.uid)
      if (!workspace) throw new Error("Failed to create a default workspace. Please try again.")
    }

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

export async function getPostStatsForHeatmap(year: number, userId?: string) {
  const uid = userId || firebaseAuth?.currentUser?.uid
  if (!uid) return []

  try {
    const workspace = await getActiveWorkspace(uid)
    if (!workspace) return []

    const postsRef = collection(firebaseDb!, "posts")
    // Note: In production we would filter by date, but since we're using Firestore without indexes for complex queries, we'll fetch all and filter in JS
    const q = query(postsRef, where("workspaceId", "==", workspace.id))
    const querySnapshot = await getDocs(q)

    const stats: Record<string, number> = {}

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.scheduledFor) {
        const date = data.scheduledFor && typeof data.scheduledFor === 'object' && 'toDate' in data.scheduledFor
          ? data.scheduledFor.toDate()
          : new Date(data.scheduledFor)

        const dateYear = date.getFullYear()
        if (dateYear === year) {
          const dateStr = date.toISOString().split('T')[0]
          stats[dateStr] = (stats[dateStr] || 0) + 1
        }
      }
    })

    return Object.entries(stats).map(([date, count]) => ({
      date,
      count,
      level: Math.min(4, Math.ceil(count / 2)) as 0 | 1 | 2 | 3 | 4
    }))
  } catch (error) {
    console.error("Error getting heatmap stats:", error)
    return []
  }
}
