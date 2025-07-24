import {
  MOCK_USER,
  mockSocialAccounts,
  mockPosts,
  mockMedia,
  mockHashtags,
  mockCaptions,
  mockAnalytics,
} from "./mock-data"
import type { PostType } from "@/types/post"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// User functions
export const getCurrentUser = async () => {
  // TODO: Implement real user fetching logic for production
  console.log("Getting current user (mock)")
  await delay(500)
  return MOCK_USER
}

export const loginUser = async (email: string, password: string) => {
  console.log("Logging in (mock)", { email })
  await delay(800)
  return MOCK_USER
}

export const signupUser = async (name: string, email: string, password: string) => {
  console.log("Signing up (mock)", { name, email })
  await delay(1000)
  return MOCK_USER
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
  return mockSocialAccounts
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
  // TODO: Implement real post fetching logic for production
  console.log("Getting posts (mock)")
  await delay(700)
  return mockPosts
}

export const getPostById = async (id: string) => {
  console.log("Getting post (mock)", { id })
  await delay(500)
  return mockPosts.find((post) => post.id === id) || null
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
  return mockMedia
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
  return mockHashtags
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
  return mockCaptions
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
  return mockAnalytics
}
