import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { PostType } from "@/types/post"

// Mock data for offline scenarios
const MOCK_POSTS: PostType[] = [
  {
    id: "mock-post-1",
    userId: "mock-user",
    title: "Summer Collection Launch",
    description: "Check out our new summer collection! #summer #fashion",
    platform: "instagram",
    contentType: "image",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: "scheduled",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-post-2",
    userId: "mock-user",
    title: "Product Tutorial",
    description: "Learn how to use our new product in this quick tutorial!",
    platform: "youtube",
    contentType: "video",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    status: "scheduled",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-post-3",
    userId: "mock-user",
    title: "Behind the Scenes",
    description: "Take a look behind the scenes of our latest photoshoot! #bts",
    platform: "tiktok",
    contentType: "video",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    status: "scheduled",
    createdAt: new Date().toISOString(),
  },
]

// Helper function to check if Firestore is available
const isFirestoreAvailable = () => {
  return typeof window !== "undefined" && firebaseDb !== undefined
}

// Helper function to check if we're in demo/preview mode
const isPreviewMode = () => {
  return (
    process.env.NODE_ENV === "development" && typeof window !== "undefined" && window.location.hostname === "localhost"
  )
}

export async function getScheduledPosts() {
  // If we're in preview mode, return mock data
  if (isPreviewMode()) {
    console.log("Using mock posts for preview mode")
    return MOCK_POSTS
  }

  // Check if we're in the browser and Firestore is available
  if (!isFirestoreAvailable()) {
    console.warn("Firestore is not available, using mock posts")
    return MOCK_POSTS
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    console.warn("User not authenticated, using mock posts")
    return MOCK_POSTS
  }

  try {
    const postsRef = collection(firebaseDb, "posts")
    const q = query(postsRef, where("userId", "==", user.uid))
    const querySnapshot = await getDocs(q)

    const posts: PostType[] = []
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      } as PostType)
    })

    // Sort by scheduled date
    return posts.sort((a, b) => {
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    })
  } catch (error) {
    console.error("Error getting scheduled posts:", error)

    // If we get an offline error, return mock data
    if (error.message?.includes("offline")) {
      console.log("Client is offline, using mock posts")
      return MOCK_POSTS
    }

    // Return empty array as fallback
    return []
  }
}

export async function getPost(postId: string) {
  // If we're in preview mode, return mock data
  if (isPreviewMode()) {
    const mockPost = MOCK_POSTS.find((post) => post.id === postId)
    if (mockPost) return mockPost

    // If not found, return the first mock post
    return MOCK_POSTS[0]
  }

  // Check if we're in the browser and Firestore is available
  if (!isFirestoreAvailable()) {
    console.warn("Firestore is not available, using mock post")
    return MOCK_POSTS[0]
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    console.warn("User not authenticated, using mock post")
    return MOCK_POSTS[0]
  }

  try {
    const postRef = doc(firebaseDb, "posts", postId)
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
  } catch (error) {
    console.error("Error getting post by ID:", error)

    // If we get an offline error, return mock data
    if (error.message?.includes("offline")) {
      console.log("Client is offline, using mock post")
      return MOCK_POSTS[0]
    }

    return null
  }
}

export async function createPost(postData: Omit<PostType, "id" | "createdAt" | "updatedAt">) {
  // If we're in preview mode, just return a mock ID
  if (isPreviewMode()) {
    console.log("Mock creating post in preview mode")
    return `mock-post-${Date.now()}`
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const postsRef = collection(firebaseDb, "posts")
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
  // If we're in preview mode, just return success
  if (isPreviewMode()) {
    console.log(`Mock updating post ${postId} in preview mode`)
    return
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const postRef = doc(firebaseDb, "posts", postId)
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
  // If we're in preview mode, just return success
  if (isPreviewMode()) {
    console.log(`Mock deleting post ${postId} in preview mode`)
    return
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const postRef = doc(firebaseDb, "posts", postId)
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
