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
    // Call the service directly instead of using fetch (avoids relative URL issues on server)
    const { fetchThreadsStats } = await import("@/lib/threads-service")
    const { followers, posts } = await fetchThreadsStats(
      token,
      threads.id,
      String(threads.username || "").replace(/^@+/, "")
    )

    if (followers <= 0) return accounts

    const updatedAt = new Date().toISOString()
    const updatedThreads = {
      ...threads,
      followers,
      posts,
      updatedAt,
    }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.threads.followers": followers,
        "accounts.threads.posts": posts,
        "accounts.threads.updatedAt": updatedAt,
        updatedAt: updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "threads.followers": followers,
        "threads.posts": posts,
        "threads.updatedAt": updatedAt,
      })
    }

    return {
      ...accounts,
      threads: updatedThreads,
    }
  } catch (err) {
    console.warn("hydrateThreadsFollowers: Failed to hydrate:", err)
    return accounts
  }
}

async function hydrateLinkedInFollowers(accounts: any, workspaceId?: string, userId?: string) {
  const linkedin = accounts?.linkedin
  if (!linkedin || !linkedin.connected) return accounts

  const currentFollowers = Number(linkedin.followers || 0)
  const token = linkedin.accessToken || linkedin.access_token
  const personId = linkedin.id

  if (currentFollowers > 0 || !token || !personId) return accounts

  try {
    const { fetchLinkedInStats } = await import("@/lib/linkedin-service")
    const { followers, posts } = await fetchLinkedInStats(token, `urn:li:person:${personId}`)

    if (followers <= 0 && posts <= 0) return accounts

    const updatedAt = new Date().toISOString()
    const updatedLinkedIn = {
      ...linkedin,
      followers: followers || linkedin.followers,
      posts: posts || linkedin.posts,
      updatedAt,
    }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.linkedin.followers": followers || linkedin.followers,
        "accounts.linkedin.posts": posts || linkedin.posts,
        "accounts.linkedin.updatedAt": updatedAt,
        updatedAt: updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "linkedin.followers": followers || linkedin.followers,
        "linkedin.posts": posts || linkedin.posts,
        "linkedin.updatedAt": updatedAt,
      })
    }

    return {
      ...accounts,
      linkedin: updatedLinkedIn,
    }
  } catch (err) {
    console.warn("hydrateLinkedInFollowers: Failed to hydrate:", err)
    return accounts
  }
}

async function hydrateFacebookFollowers(accounts: any, workspaceId?: string, userId?: string) {
  const facebook = accounts?.facebook
  if (!facebook || !facebook.connected) return accounts

  const currentFollowers = Number(facebook.followers || 0)
  const token = facebook.accessToken || facebook.access_token
  const pageId = facebook.id

  if (currentFollowers > 0 || !token || !pageId) return accounts

  try {
    const { config } = await import("@/lib/config")
    const response = await fetch(
      `https://graph.facebook.com/v${config.facebook.apiVersion}/${pageId}?fields=followers_count,fan_count&access_token=${token}`
    )

    if (!response.ok) return accounts

    const data = await response.json()
    const followers = data.followers_count ?? data.fan_count ?? 0

    if (followers <= 0) return accounts

    const updatedAt = new Date().toISOString()
    const updatedFacebook = {
      ...facebook,
      followers,
      updatedAt,
    }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.facebook.followers": followers,
        "accounts.facebook.updatedAt": updatedAt,
        updatedAt: updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "facebook.followers": followers,
        "facebook.updatedAt": updatedAt,
      })
    }

    return {
      ...accounts,
      facebook: updatedFacebook,
    }
  } catch (err) {
    console.warn("hydrateFacebookFollowers: Failed to hydrate:", err)
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
      const withThreads = await hydrateThreadsFollowers(normalized, workspace?.id, uid)
      const withLinkedIn = await hydrateLinkedInFollowers(withThreads, workspace?.id, uid)
      return await hydrateFacebookFollowers(withLinkedIn, workspace?.id, uid)
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
    const withThreads = await hydrateThreadsFollowers(normalized, undefined, uid)
    const withLinkedIn = await hydrateLinkedInFollowers(withThreads, undefined, uid)
    return await hydrateFacebookFollowers(withLinkedIn, undefined, uid)
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
