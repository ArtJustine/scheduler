import type { PostType } from "@/types/post"
import type { MediaItem } from "@/types/media"
import type { HashtagGroup } from "@/types/hashtag"
import type { CaptionTemplate } from "@/types/caption"
import type { SocialAccounts } from "@/types/social"
import { signIn, signUp, getCurrentUser as firebaseGetCurrentUser, signOut } from "@/lib/firebase/auth"
import {
  getScheduledPosts as firebaseGetScheduledPosts,
  getPost as firebaseGetPost,
  createPost as firebaseCreatePost,
  updatePost as firebaseUpdatePost,
  deletePost as firebaseDeletePost
} from "@/lib/firebase/posts"
import {
  getSocialAccounts as firebaseGetSocialAccounts,
  connectSocialAccount as firebaseConnectSocialAccount,
  disconnectSocialAccount as firebaseDisconnectSocialAccount
} from "@/lib/firebase/social-accounts"
import {
  getMediaLibrary as firebaseGetMediaLibrary,
  uploadMediaToLibrary as firebaseUploadMedia,
  deleteMediaFromLibrary as firebaseDeleteMedia
} from "@/lib/firebase/media"
import {
  getHashtagGroups as firebaseGetHashtagGroups,
  createHashtagGroup as firebaseCreateHashtag,
  deleteHashtagGroup as firebaseDeleteHashtag
} from "@/lib/firebase/hashtags"
import {
  getCaptionTemplates as firebaseGetCaptionTemplates,
  createCaptionTemplate as firebaseCreateCaption,
  deleteCaptionTemplate as firebaseDeleteCaption
} from "@/lib/firebase/captions"
import { getUserStats as firebaseGetAnalytics } from "@/lib/firebase/stats"

// User functions
export const getCurrentUser = async () => {
  try {
    const user = await firebaseGetCurrentUser()
    if (!user) return null
    return {
      id: user.uid,
      name: user.displayName || "User",
      email: user.email,
      photoURL: user.photoURL
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
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
      throw new Error(error.message || "Couldn’t log you in. Please check your email and password and try again.")
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
      throw new Error(error.message || "Couldn’t create your account. Please check your details and try again.")
    }
  }
}

export const logout = async () => {
  try {
    await signOut()
    return true
  } catch (error) {
    console.error("Error logging out:", error)
    throw error
  }
}

// Social account functions
export const getSocialAccounts = async (userId?: string): Promise<SocialAccounts> => {
  return await firebaseGetSocialAccounts(userId)
}

export const connectSocialAccount = async (platform: string, accountData: any) => {
  return await firebaseConnectSocialAccount(platform as any, accountData)
}

export const disconnectSocialAccount = async (platform: string) => {
  return await firebaseDisconnectSocialAccount(platform as any)
}

// Post functions
export const getPosts = async (userId?: string) => {
  return await firebaseGetScheduledPosts(userId)
}

export const getPostById = async (id: string) => {
  return await firebaseGetPost(id)
}

export const createPost = async (data: Partial<PostType>) => {
  // @ts-ignore - Ignoring Omit for simplicity in this bridge layer
  return await firebaseCreatePost(data)
}

export const updatePost = async (id: string, data: any) => {
  return await firebaseUpdatePost(id, data)
}

export const deletePost = async (id: string) => {
  return await firebaseDeletePost(id)
}

export const schedulePost = async (id: string, date: string) => {
  return await firebaseUpdatePost(id, { scheduledFor: date, status: "scheduled" })
}

// Media functions
export const getMediaLibrary = async (userId?: string): Promise<MediaItem[]> => {
  return await firebaseGetMediaLibrary(userId)
}

export const uploadMedia = async (file: File, title: string, type: "image" | "video") => {
  return await firebaseUploadMedia({ file, title, type })
}

export const deleteMedia = async (id: string) => {
  return await firebaseDeleteMedia(id)
}

// Hashtag functions
export const getHashtagGroups = async (userId?: string): Promise<HashtagGroup[]> => {
  return await firebaseGetHashtagGroups(userId)
}

export const createHashtag = async (name: string, hashtags: string[]) => {
  return await firebaseCreateHashtag({ name, hashtags })
}

export const deleteHashtag = async (id: string) => {
  return await firebaseDeleteHashtag(id)
}

// Caption functions
export const getCaptionTemplates = async (userId?: string): Promise<CaptionTemplate[]> => {
  return await firebaseGetCaptionTemplates(userId)
}

export const createCaption = async (title: string, content: string) => {
  return await firebaseCreateCaption({ title, content })
}

export const deleteCaption = async (id: string) => {
  return await firebaseDeleteCaption(id)
}

// Analytics functions
export const getAnalytics = async (timeframe: string = "month") => {
  return await firebaseGetAnalytics(timeframe)
}

// Scheduled posts functions
export const getScheduledPosts = async (userId?: string) => {
  return await firebaseGetScheduledPosts(userId)
}
