import type { PostType } from "@/types/post"
import type { SocialAccount, SocialAccountType, SocialAccounts } from "@/types/social"
import type { MediaItem } from "@/types/media"
import type { HashtagGroup } from "@/types/hashtag"
import type { CaptionTemplate } from "@/types/caption"
import { v4 as uuidv4 } from "uuid"

// Import mock data
import {
  MOCK_ACCOUNTS,
  MOCK_POSTS,
  MOCK_PUBLISHED_POSTS,
  MOCK_MEDIA,
  MOCK_HASHTAG_GROUPS,
  MOCK_CAPTION_TEMPLATES,
  MOCK_ANALYTICS,
  MOCK_USER,
} from "./mock-data"

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Social accounts service
export async function getSocialAccounts(): Promise<SocialAccounts> {
  await delay(500) // Simulate API delay
  return { ...MOCK_ACCOUNTS }
}

export async function connectSocialAccount(platform: SocialAccountType, accountData: SocialAccount): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock connecting ${platform} account:`, accountData)
  // In a real implementation, this would update the database
}

export async function disconnectSocialAccount(platform: SocialAccountType): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock disconnecting ${platform} account`)
  // In a real implementation, this would update the database
}

// Posts service
export async function getScheduledPosts(): Promise<PostType[]> {
  await delay(700) // Simulate API delay
  return [...MOCK_POSTS]
}

export async function getPublishedPosts(): Promise<PostType[]> {
  await delay(700) // Simulate API delay
  return [...MOCK_PUBLISHED_POSTS]
}

export async function getPostById(id: string): Promise<PostType | null> {
  await delay(300) // Simulate API delay
  const allPosts = [...MOCK_POSTS, ...MOCK_PUBLISHED_POSTS]
  return allPosts.find((post) => post.id === id) || null
}

export async function createPost(post: Omit<PostType, "id" | "createdAt" | "updatedAt">): Promise<string> {
  await delay(1000) // Simulate API delay
  const newId = `post-${uuidv4()}`
  console.log("Mock creating post:", { id: newId, ...post })
  return newId
}

export async function updatePost(id: string, post: Partial<PostType>): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock updating post ${id}:`, post)
  // In a real implementation, this would update the database
}

export async function deletePost(id: string): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock deleting post ${id}`)
  // In a real implementation, this would delete from the database
}

// Media service
export async function getMediaLibrary(): Promise<MediaItem[]> {
  await delay(700) // Simulate API delay
  return [...MOCK_MEDIA]
}

export async function uploadMedia(file: File, title: string, type: "image" | "video"): Promise<MediaItem> {
  await delay(1500) // Simulate API delay
  const newId = `media-${uuidv4()}`
  const newMedia: MediaItem = {
    id: newId,
    title,
    type,
    url: URL.createObjectURL(file), // Create a local URL for the file
    fileName: file.name,
    fileSize: file.size,
    createdAt: new Date().toISOString(),
  }
  console.log("Mock uploading media:", newMedia)
  return newMedia
}

export async function deleteMedia(id: string): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock deleting media ${id}`)
  // In a real implementation, this would delete from the database
}

// Hashtag service
export async function getHashtagGroups(): Promise<HashtagGroup[]> {
  await delay(500) // Simulate API delay
  return [...MOCK_HASHTAG_GROUPS]
}

export async function createHashtagGroup(data: { name: string; hashtags: string[] }): Promise<HashtagGroup> {
  await delay(800) // Simulate API delay
  const newId = `hashtag-${uuidv4()}`
  const now = new Date().toISOString()
  const newGroup: HashtagGroup = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now,
  }
  console.log("Mock creating hashtag group:", newGroup)
  return newGroup
}

export async function updateHashtagGroup(id: string, data: Partial<HashtagGroup>): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock updating hashtag group ${id}:`, data)
  // In a real implementation, this would update the database
}

export async function deleteHashtagGroup(id: string): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock deleting hashtag group ${id}`)
  // In a real implementation, this would delete from the database
}

// Caption service
export async function getCaptionTemplates(): Promise<CaptionTemplate[]> {
  await delay(500) // Simulate API delay
  return [...MOCK_CAPTION_TEMPLATES]
}

export async function createCaptionTemplate(data: { title: string; content: string }): Promise<CaptionTemplate> {
  await delay(800) // Simulate API delay
  const newId = `caption-${uuidv4()}`
  const now = new Date().toISOString()
  const newTemplate: CaptionTemplate = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now,
  }
  console.log("Mock creating caption template:", newTemplate)
  return newTemplate
}

export async function updateCaptionTemplate(id: string, data: Partial<CaptionTemplate>): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock updating caption template ${id}:`, data)
  // In a real implementation, this would update the database
}

export async function deleteCaptionTemplate(id: string): Promise<void> {
  await delay(800) // Simulate API delay
  console.log(`Mock deleting caption template ${id}`)
  // In a real implementation, this would delete from the database
}

// Analytics service
export async function getAnalytics() {
  await delay(1000) // Simulate API delay
  return { ...MOCK_ANALYTICS }
}

// User service
export function getCurrentUser() {
  return { ...MOCK_USER }
}

// Mock auth state change handler
export function onAuthStateChange(callback: (user: any) => void) {
  setTimeout(() => {
    callback({ ...MOCK_USER })
  }, 100)
  return () => {}
}

// Authentication service (mock implementations)
export async function loginUser(email: string, password: string): Promise<void> {
  await delay(1000) // Simulate API delay
  console.log(`Mock login for user ${email}`)
  // In a real implementation, this would authenticate with the backend
}

export async function signupUser(email: string, password: string): Promise<void> {
  await delay(1500) // Simulate API delay
  console.log(`Mock signup for user ${email}`)
  // In a real implementation, this would register with the backend
}

export async function logoutUser(): Promise<void> {
  await delay(800) // Simulate API delay
  console.log("Mock logout")
  // In a real implementation, this would sign out from the backend
}

// User profile service
export async function updateUserProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
  await delay(1000) // Simulate API delay
  console.log("Mock updating user profile:", data)
  // In a real implementation, this would update the user profile
}

export async function updateUserAvatar(file: File): Promise<string> {
  await delay(1500) // Simulate API delay
  const photoURL = URL.createObjectURL(file) // Create a local URL for the file
  console.log("Mock updating user avatar:", { file, photoURL })
  return photoURL
}

export async function getUserProfile() {
  await delay(500) // Simulate API delay
  return { ...MOCK_USER }
}

// Stats service
export async function getUserStats() {
  await delay(800) // Simulate API delay
  return {
    totalPosts: MOCK_ANALYTICS.overview.totalPosts,
    scheduledPosts: MOCK_ANALYTICS.overview.scheduledPosts,
    publishedPosts: MOCK_ANALYTICS.overview.publishedPosts,
  }
}
