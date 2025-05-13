import type { PostType } from "@/types/post"
import type { SocialAccount, SocialAccountType, SocialAccounts } from "@/types/social"

// Determine if we're in preview mode
const isPreviewMode = () => {
  return (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))
  )
}

// Mock data for social accounts
const MOCK_ACCOUNTS: SocialAccounts = {
  instagram: {
    username: "demo_instagram",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 1250,
    followersGrowth: 5.2,
    engagement: 3.8,
    impressions: 4500,
    posts: 42,
    updatedAt: new Date().toISOString(),
  },
  youtube: {
    username: "demo_youtube",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 3800,
    followersGrowth: 2.7,
    engagement: 4.5,
    impressions: 12000,
    posts: 28,
    updatedAt: new Date().toISOString(),
  },
  tiktok: {
    username: "demo_tiktok",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 5600,
    followersGrowth: 8.3,
    engagement: 6.2,
    impressions: 25000,
    posts: 35,
    updatedAt: new Date().toISOString(),
  },
}

// Mock data for posts
const MOCK_POSTS: PostType[] = [
  {
    id: "mock-post-1",
    title: "Summer Collection Launch",
    content: "Check out our new summer collection! #summer #fashion",
    platform: "instagram",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-2",
    title: "Product Tutorial",
    content: "Learn how to use our new product in this quick tutorial!",
    platform: "youtube",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-3",
    title: "Behind the Scenes",
    content: "Take a look behind the scenes of our latest photoshoot! #bts",
    platform: "tiktok",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Social accounts service
export async function getSocialAccounts(): Promise<SocialAccounts> {
  // Always use mock data in preview mode
  if (isPreviewMode()) {
    console.log("Using mock social accounts data in preview mode")
    return MOCK_ACCOUNTS
  }

  // In production, try to use Firebase
  try {
    // Dynamically import Firebase only when needed
    const { getSocialAccounts: getFirebaseSocialAccounts } = await import("./firebase/social-accounts")
    return await getFirebaseSocialAccounts()
  } catch (error) {
    console.error("Error getting social accounts from Firebase:", error)
    // Fall back to mock data if there's an error
    return MOCK_ACCOUNTS
  }
}

export async function connectSocialAccount(platform: SocialAccountType, accountData: SocialAccount): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log(`Mock connecting ${platform} account in preview mode:`, accountData)
    return
  }

  // In production, use Firebase
  try {
    const { connectSocialAccount: connectFirebaseSocialAccount } = await import("./firebase/social-accounts")
    return await connectFirebaseSocialAccount(platform, accountData)
  } catch (error) {
    console.error(`Error connecting ${platform} account in Firebase:`, error)
    throw error
  }
}

export async function disconnectSocialAccount(platform: SocialAccountType): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log(`Mock disconnecting ${platform} account in preview mode`)
    return
  }

  // In production, use Firebase
  try {
    const { disconnectSocialAccount: disconnectFirebaseSocialAccount } = await import("./firebase/social-accounts")
    return await disconnectFirebaseSocialAccount(platform)
  } catch (error) {
    console.error(`Error disconnecting ${platform} account in Firebase:`, error)
    throw error
  }
}

// Posts service
export async function getScheduledPosts(): Promise<PostType[]> {
  // Always use mock data in preview mode
  if (isPreviewMode()) {
    console.log("Using mock posts data in preview mode")
    return MOCK_POSTS
  }

  // In production, try to use Firebase
  try {
    // Dynamically import Firebase only when needed
    const { getScheduledPosts: getFirebaseScheduledPosts } = await import("./firebase/posts")
    return await getFirebaseScheduledPosts()
  } catch (error) {
    console.error("Error getting posts from Firebase:", error)
    // Fall back to mock data if there's an error
    return MOCK_POSTS
  }
}

export async function getPostById(id: string): Promise<PostType | null> {
  // In preview mode, find the post in mock data
  if (isPreviewMode()) {
    console.log(`Looking for mock post with id: ${id}`)
    const post = MOCK_POSTS.find((p) => p.id === id)
    return post || null
  }

  // In production, use Firebase
  try {
    const { getPostById: getFirebasePostById } = await import("./firebase/posts")
    return await getFirebasePostById(id)
  } catch (error) {
    console.error(`Error getting post ${id} from Firebase:`, error)
    // Try to find the post in mock data as fallback
    const post = MOCK_POSTS.find((p) => p.id === id)
    return post || null
  }
}

export async function createPost(post: Omit<PostType, "id" | "createdAt" | "updatedAt">): Promise<string> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log("Mock creating post in preview mode:", post)
    return `mock-post-${Date.now()}`
  }

  // In production, use Firebase
  try {
    const { createPost: createFirebasePost } = await import("./firebase/posts")
    return await createFirebasePost(post)
  } catch (error) {
    console.error("Error creating post in Firebase:", error)
    throw error
  }
}

export async function updatePost(id: string, post: Partial<PostType>): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log(`Mock updating post ${id} in preview mode:`, post)
    return
  }

  // In production, use Firebase
  try {
    const { updatePost: updateFirebasePost } = await import("./firebase/posts")
    return await updateFirebasePost(id, post)
  } catch (error) {
    console.error(`Error updating post ${id} in Firebase:`, error)
    throw error
  }
}

export async function deletePost(id: string): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log(`Mock deleting post ${id} in preview mode`)
    return
  }

  // In production, use Firebase
  try {
    const { deletePost: deleteFirebasePost } = await import("./firebase/posts")
    return await deleteFirebasePost(id)
  } catch (error) {
    console.error(`Error deleting post ${id} in Firebase:`, error)
    throw error
  }
}

// Authentication service
export async function loginUser(email: string, password: string): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log(`Mock login for user ${email} in preview mode`)
    return
  }

  // In production, use Firebase
  try {
    const { loginUser: loginFirebaseUser } = await import("./firebase/auth")
    return await loginFirebaseUser(email, password)
  } catch (error) {
    console.error("Error logging in with Firebase:", error)
    throw error
  }
}

export async function signupUser(email: string, password: string): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log(`Mock signup for user ${email} in preview mode`)
    return
  }

  // In production, use Firebase
  try {
    const { signupUser: signupFirebaseUser } = await import("./firebase/auth")
    return await signupFirebaseUser(email, password)
  } catch (error) {
    console.error("Error signing up with Firebase:", error)
    throw error
  }
}

export async function logoutUser(): Promise<void> {
  // In preview mode, just log the action
  if (isPreviewMode()) {
    console.log("Mock logout in preview mode")
    return
  }

  // In production, use Firebase
  try {
    const { logoutUser: logoutFirebaseUser } = await import("./firebase/auth")
    return await logoutFirebaseUser()
  } catch (error) {
    console.error("Error logging out with Firebase:", error)
    throw error
  }
}

// User service
export function getCurrentUser() {
  // In preview mode, return a mock user
  if (isPreviewMode()) {
    return {
      uid: "mock-user-id",
      email: "demo@example.com",
      displayName: "Demo User",
    }
  }

  // In production, try to use Firebase
  try {
    // We need to handle this differently since it's not async
    if (typeof window !== "undefined") {
      const { firebaseAuth } = require("./firebase-client")
      return firebaseAuth?.currentUser
    }
    return null
  } catch (error) {
    console.error("Error getting current user from Firebase:", error)
    return null
  }
}

// Mock auth state change handler for preview mode
export function onAuthStateChange(callback: (user: any) => void) {
  // In preview mode, immediately call with mock user and return noop
  if (isPreviewMode()) {
    setTimeout(() => {
      callback({
        uid: "mock-user-id",
        email: "demo@example.com",
        displayName: "Demo User",
      })
    }, 100)
    return () => {}
  }

  // In production, use Firebase
  try {
    if (typeof window !== "undefined") {
      const { onAuthStateChanged } = require("firebase/auth")
      const { firebaseAuth } = require("./firebase-client")
      return onAuthStateChanged(firebaseAuth, callback)
    }
    return () => {}
  } catch (error) {
    console.error("Error setting up auth state change listener:", error)
    return () => {}
  }
}
