import { doc, getDoc, updateDoc, deleteField, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { SocialAccount, SocialAccountType } from "@/types/social"
import { getActiveWorkspace } from "./workspaces"

// Remove all mock data, preview mode, and offline fallback logic. Only use real Firestore data for all social account functions.

export async function getSocialAccounts(userId?: string) {
  const uid = userId || firebaseAuth?.currentUser?.uid

  if (!uid) {
    console.log("getSocialAccounts: No userId provided or found on auth")
    return {}
  }

  try {
    console.log("getSocialAccounts: Fetching for user", uid)
    if (!firebaseDb) throw new Error("Database not initialized")

    // Get active workspace
    const workspace = await getActiveWorkspace(uid)
    if (!workspace) return {}

    const accounts = workspace.accounts || {}
    return {
      instagram: accounts.instagram || null,
      youtube: accounts.youtube || null,
      tiktok: accounts.tiktok || null,
      threads: accounts.threads || null,
      facebook: accounts.facebook || null,
      twitter: accounts.twitter || null,
      pinterest: accounts.pinterest || null,
      linkedin: accounts.linkedin || null,
    }
  } catch (error) {
    console.error("Error getting social accounts:", error)
    throw error
  }
}

export async function connectSocialAccount(platform: SocialAccountType, accountData: SocialAccount) {
  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    if (!firebaseDb) throw new Error("Database not initialized")

    // Get active workspace
    const workspace = await getActiveWorkspace(user.uid)
    if (!workspace) throw new Error("No active workspace found")

    const workspaceRef = doc(firebaseDb, "workspaces", workspace.id)

    // Update the workspace document's accounts field
    await updateDoc(workspaceRef, {
      [`accounts.${platform}`]: {
        ...accountData,
        followers: accountData.followers || 0,
        followersGrowth: accountData.followersGrowth || 0,
        engagement: accountData.engagement || 0,
        impressions: accountData.impressions || 0,
        posts: accountData.posts || 0,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error(`Error connecting ${platform} account:`, error)
    throw error
  }
}

export async function disconnectSocialAccount(platform: SocialAccountType) {
  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    if (!firebaseDb) throw new Error("Database not initialized")

    // Get active workspace
    const workspace = await getActiveWorkspace(user.uid)
    if (!workspace) throw new Error("No active workspace found")

    const workspaceRef = doc(firebaseDb, "workspaces", workspace.id)

    // Remove the platform data from accounts
    await updateDoc(workspaceRef, {
      [`accounts.${platform}`]: deleteField(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error(`Error disconnecting ${platform} account:`, error)
    throw error
  }
}

export async function updateSocialAccountStats(platform: SocialAccountType, stats: Partial<SocialAccount>) {
  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const userData = userDoc.data()
    const platformData = userData[platform]

    if (!platformData) {
      throw new Error(`No ${platform} account connected`)
    }

    await updateDoc(userDocRef, {
      [platform]: {
        ...platformData,
        ...stats,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error(`Error updating ${platform} account stats:`, error)
    throw error
  }
}

// This function would be used in a real implementation to refresh expired tokens
export async function refreshSocialToken(platform: SocialAccountType) {
  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const userData = userDoc.data()
    const platformData = userData[platform]

    if (!platformData || !platformData.refreshToken) {
      throw new Error(`No ${platform} account connected or no refresh token available`)
    }

    // In a real implementation, this would make an API call to the platform to refresh the token
    // For this example, we'll simulate a successful refresh
    const newAccessToken = `refreshed_${platform}_token_${Date.now()}`

    await updateDoc(userDocRef, {
      [platform]: {
        ...platformData,
        accessToken: newAccessToken,
        updatedAt: new Date().toISOString(),
      },
    })

    return newAccessToken
  } catch (error) {
    console.error(`Error refreshing ${platform} token:`, error)
    throw error
  }
}
