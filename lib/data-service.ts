import type { PostType } from "@/types/post"
import { signIn, signUp } from "@/lib/firebase/auth"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// User functions
export const getCurrentUser = async () => {
  // TODO: Implement real user fetching logic for production
  console.log("Getting current user (mock)")
  await delay(500)
  return { id: "mock-user-id", name: "Mock User", email: "mock@example.com" }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const result = await signIn(email, password)
    if (!result.user) {
      throw new Error("No account found with that email. Please sign up.")
    }
    return result.user
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with that email. Please sign up.")
    } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      throw new Error("That password doesn’t look right. Please try again.")
    } else if (error.message?.includes("Authentication service is unavailable")) {
      throw new Error("We’re having trouble reaching the authentication service. Please refresh and try again.")
    } else {
      throw new Error("Couldn’t log you in. Please check your email and password and try again.")
    }
  }
}

export const signupUser = async (name: string, email: string, password: string) => {
  try {
    const result = await signUp(email, password, name)
    if (!result.user) {
      throw new Error("Failed to sign up. Please try again.")
    }
    return result.user
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("An account with that email already exists. Please log in.")
    } else if (error.code === "auth/operation-not-allowed") {
      throw new Error("Email/password sign up is disabled for this project. Please contact support.")
    } else if (error.code === "auth/weak-password") {
      throw new Error("Please choose a stronger password (at least 6 characters).")
    } else if (error.message?.includes("Authentication service is unavailable")) {
      throw new Error("We’re having trouble reaching the authentication service. Please refresh and try again.")
    } else {
      throw new Error("Couldn’t create your account. Please check your details and try again.")
    }
  }
}

export const logout = async () => {
  console.log("Logging out (mock)")
  await delay(300)
  return true
}

// Social account functions
export const getSocialAccounts = async () => {
  // TODO: Implement real social account fetching logic for production
  console.log("Getting social accounts (mock)")
  await delay(600)
  return []
}

export const connectSocialAccount = async (platform: string) => {
  console.log("Connecting social account (mock)", { platform })
  await delay(1000)
  return true
}

export const disconnectSocialAccount = async (platform: string) => {
  console.log("Disconnecting social account (mock)", { platform })
  await delay(700)
  return true
}

// Post functions
export const getPosts = async () => {
  return []
}

export const getPostById = async (_id: string) => {
  return null
}

export const createPost = async (data: Partial<PostType>) => {
  console.log("Creating post (mock)", { data })
  await delay(1000)
  return { id: "new-post-id", ...data }
}

export const updatePost = async (id: string, data: any) => {
  console.log("Updating post (mock)", { id, data })
  await delay(800)
  return true
}

export const deletePost = async (id: string) => {
  console.log("Deleting post (mock)", { id })
  await delay(600)
  return true
}

export const schedulePost = async (id: string, date: string) => {
  console.log("Scheduling post (mock)", { id, date })
  await delay(700)
  return true
}

// Media functions
export const getMediaLibrary = async () => {
  console.log("Getting media (mock)")
  await delay(800)
  return [
    { id: "1", url: "/placeholder.svg?height=400&width=400", type: "image", uploadedAt: "2023-10-26T09:00:00Z" },
    { id: "2", url: "/placeholder.svg?height=400&width=400", type: "video", uploadedAt: "2023-10-26T10:00:00Z" },
  ]
}

export const uploadMedia = async (file: File) => {
  console.log("Uploading media (mock)", { fileName: file.name })
  await delay(1500)
  return { id: "new-media-id", url: "/placeholder.svg?height=400&width=400" }
}

export const deleteMedia = async (id: string) => {
  console.log("Deleting media (mock)", { id })
  await delay(500)
  return true
}

// Hashtag functions
export const getHashtagGroups = async () => {
  console.log("Getting hashtags (mock)")
  await delay(400)
  return [
    { id: "1", name: "Mock Hashtag 1", posts: 10 },
    { id: "2", name: "Mock Hashtag 2", posts: 5 },
  ]
}

export const createHashtag = async (name: string) => {
  console.log("Creating hashtag (mock)", { name })
  await delay(600)
  return { id: "new-hashtag-id", name }
}

export const deleteHashtag = async (id: string) => {
  console.log("Deleting hashtag (mock)", { id })
  await delay(300)
  return true
}

// Caption functions
export const getCaptionTemplates = async () => {
  console.log("Getting captions (mock)")
  await delay(500)
  return [
    { id: "1", text: "Mock Caption 1" },
    { id: "2", text: "Mock Caption 2" },
  ]
}

export const createCaption = async (text: string) => {
  console.log("Creating caption (mock)", { text })
  await delay(700)
  return { id: "new-caption-id", text }
}

export const deleteCaption = async (id: string) => {
  console.log("Deleting caption (mock)", { id })
  await delay(400)
  return true
}

// Analytics functions
export const getAnalytics = async () => {
  console.log("Getting analytics (mock)")
  await delay(900)
  return {
    totalPosts: 100,
    totalMedia: 50,
    totalHashtags: 20,
    totalCaptions: 10,
    totalUsers: 10,
  }
}
