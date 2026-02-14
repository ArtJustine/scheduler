import { doc, getDoc, updateDoc, deleteField, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { SocialAccount, SocialAccountType } from "@/types/social"
import { getActiveWorkspace } from "./workspaces"

// Remove all mock data, preview mode, and offline fallback logic. Only use real Firestore data for all social account functions.

function normalizeAccount(account: any) {
  if (!account) return null

  const normalizedFollowers = Number(
    account.followers ??
    account.followersCount ??
    account.follower_count ??
    account.followers_count ??
    account.threads_follower_count ??
    account.total_follower_count ??
    0
  ) || 0

  const normalizedPosts = Number(
    account.posts ??
    account.media_count ??
    account.video_count ??
    0
  ) || 0

  return {
    ...account,
    username: account.username || account.name || account.display_name || "User",
    profileImage: account.profileImage || account.profile_picture_url || account.threads_profile_picture_url || account.avatar_url || null,
    followers: normalizedFollowers,
    posts: normalizedPosts,
    connected: Boolean(account.connected ?? account.accessToken ?? account.access_token),
  }
}

async function hydrateThreadsFollowers(accounts: any, workspaceId?: string, userId?: string) {
  const threads = accounts?.threads
  if (!threads || !threads.connected) return accounts

  const currentFollowers = Number(
    threads.followers ??
    threads.followersCount ??
    threads.follower_count ??
    threads.followers_count ??
    0
  ) || 0

  const token = threads.accessToken || threads.access_token
  if (currentFollowers > 0 || !token) return accounts

  try {
    const response = await fetch("/api/threads/followers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: token,
        username: threads.username,
        threadsId: threads.id,
      }),
    })

    if (!response.ok) return accounts
    const data = await response.json()
    const followers = Number(data?.followers ?? 0) || 0
    const posts = Number(data?.posts ?? threads.posts ?? 0) || 0
    if (followers <= 0) return accounts

    const updatedThreads = {
      ...threads,
      followers,
      posts,
      updatedAt: new Date().toISOString(),
    }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.threads.followers": followers,
        "accounts.threads.posts": posts,
        "accounts.threads.updatedAt": updatedThreads.updatedAt,
        updatedAt: updatedThreads.updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "threads.followers": followers,
        "threads.posts": posts,
        "threads.updatedAt": updatedThreads.updatedAt,
      })
    }

    return {
      ...accounts,
      threads: updatedThreads,
    }
  } catch {
    return accounts
  }
}

export async function getSocialAccounts(userId?: string) {
  const uid = userId || firebaseAuth?.currentUser?.uid

  if (!uid) {
    console.log("getSocialAccounts: No userId provided or found on auth")
    return {}
  }

  try {
    console.log("getSocialAccounts: Fetching for user", uid)
    if (!firebaseDb) throw new Error("Database not initialized")

    const emptyAccounts = {
      instagram: null,
      youtube: null,
      tiktok: null,
      threads: null,
      facebook: null,
      twitter: null,
      pinterest: null,
      linkedin: null,
    }

    // Prefer active workspace accounts
    const workspace = await getActiveWorkspace(uid)
    const workspaceAccounts = workspace?.accounts || {}

    const hasWorkspaceAccounts = Object.values(workspaceAccounts).some((account: any) => Boolean(account))
    if (hasWorkspaceAccounts) {
      const normalized = {
        ...emptyAccounts,
        instagram: normalizeAccount(workspaceAccounts.instagram),
        youtube: normalizeAccount(workspaceAccounts.youtube),
        tiktok: normalizeAccount(workspaceAccounts.tiktok),
        threads: normalizeAccount(workspaceAccounts.threads),
        facebook: normalizeAccount(workspaceAccounts.facebook),
        twitter: normalizeAccount(workspaceAccounts.twitter),
        pinterest: normalizeAccount(workspaceAccounts.pinterest),
        linkedin: normalizeAccount(workspaceAccounts.linkedin),
      }
      return await hydrateThreadsFollowers(normalized, workspace?.id, uid)
    }

    // Fallback for legacy data stored directly in users/{uid}
    const userDocRef = doc(firebaseDb, "users", uid)
    const userDoc = await getDoc(userDocRef)
    if (!userDoc.exists()) {
      return emptyAccounts
    }

    const userData = userDoc.data()
    const normalized = {
      ...emptyAccounts,
      instagram: normalizeAccount(userData.instagram),
      youtube: normalizeAccount(userData.youtube),
      tiktok: normalizeAccount(userData.tiktok),
      threads: normalizeAccount(userData.threads),
      facebook: normalizeAccount(userData.facebook),
      twitter: normalizeAccount(userData.twitter),
      pinterest: normalizeAccount(userData.pinterest),
      linkedin: normalizeAccount(userData.linkedin),
    }
    return await hydrateThreadsFollowers(normalized, undefined, uid)
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
