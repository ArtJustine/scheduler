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
  if (!token) return accounts

  const lastUpdated = threads.updatedAt ? new Date(threads.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (currentFollowers > 0 && !isOld) return accounts

  try {
    // Call the service directly instead of using fetch (avoids relative URL issues on server)
    const { fetchThreadsStats } = await import("@/lib/threads-service")
    const { followers, posts } = await fetchThreadsStats(
      token,
      threads.id,
      String(threads.username || "").replace(/^@+/, "")
    )

    if (followers === 0 && posts === 0 && currentFollowers > 0 && !isOld) return accounts

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

  // Allow update if followers is 0 OR if it hasn't been updated in 1 hour
  const lastUpdated = linkedin.updatedAt ? new Date(linkedin.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (currentFollowers > 0 && !isOld) return accounts

  try {
    const { fetchLinkedInStats } = await import("@/lib/linkedin-service")
    const { followers, posts } = await fetchLinkedInStats(token, personId)

    // Only update if we actually got some data or if it's been a while
    if (followers === 0 && posts === 0 && currentFollowers > 0 && !isOld) return accounts

    const updatedAt = new Date().toISOString()
    const updatedLinkedIn = {
      ...linkedin,
      followers: followers || linkedin.followers || 0,
      posts: posts || linkedin.posts || 0,
      updatedAt,
    }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.linkedin.followers": updatedLinkedIn.followers,
        "accounts.linkedin.posts": updatedLinkedIn.posts,
        "accounts.linkedin.updatedAt": updatedAt,
        updatedAt: updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "linkedin.followers": updatedLinkedIn.followers,
        "linkedin.posts": updatedLinkedIn.posts,
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

async function hydratePinterestFollowers(accounts: any, workspaceId?: string, userId?: string) {
  const pinterest = accounts?.pinterest
  if (!pinterest || !pinterest.connected) return accounts

  const currentFollowers = Number(pinterest.followers || 0)
  const token = pinterest.accessToken || pinterest.access_token

  const lastUpdated = pinterest.updatedAt ? new Date(pinterest.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (currentFollowers > 0 && !isOld) return accounts

  try {
    const { fetchPinterestStats } = await import("@/lib/pinterest-service")
    const { followers, posts } = await fetchPinterestStats(token)

    if (followers === 0 && posts === 0 && currentFollowers > 0 && !isOld) return accounts

    const updatedAt = new Date().toISOString()
    const updatedPinterest = {
      ...pinterest,
      followers: followers || pinterest.followers || 0,
      posts: posts || pinterest.posts || 0,
      updatedAt,
    }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.pinterest.followers": updatedPinterest.followers,
        "accounts.pinterest.posts": updatedPinterest.posts,
        "accounts.pinterest.updatedAt": updatedAt,
        updatedAt: updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "pinterest.followers": updatedPinterest.followers,
        "pinterest.posts": updatedPinterest.posts,
        "pinterest.updatedAt": updatedAt,
      })
    }

    return {
      ...accounts,
      pinterest: updatedPinterest,
    }
  } catch (err) {
    console.warn("hydratePinterestFollowers: Failed to hydrate:", err)
    return accounts
  }
}

async function hydrateYouTubeStats(accounts: any, workspaceId?: string, userId?: string) {
  const youtube = accounts?.youtube
  if (!youtube || !youtube.connected || !youtube.accessToken) return accounts

  const lastUpdated = youtube.updatedAt ? new Date(youtube.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (youtube.followers > 0 && !isOld) return accounts

  try {
    const { fetchYouTubeStats } = await import("@/lib/social-service")
    const stats = await fetchYouTubeStats(youtube.accessToken)
    if (!stats) return accounts

    const updatedAt = new Date().toISOString()
    const updatedYouTube = { ...youtube, ...stats, updatedAt }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.youtube.followers": stats.followers,
        "accounts.youtube.posts": stats.posts,
        "accounts.youtube.views": stats.views,
        "accounts.youtube.updatedAt": updatedAt,
        updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "youtube.followers": stats.followers,
        "youtube.posts": stats.posts,
        "youtube.views": stats.views,
        "youtube.updatedAt": updatedAt,
      })
    }
    return { ...accounts, youtube: updatedYouTube }
  } catch (err) {
    console.warn("hydrateYouTubeStats failed:", err)
    return accounts
  }
}

async function hydrateTikTokStats(accounts: any, workspaceId?: string, userId?: string) {
  const tiktok = accounts?.tiktok
  if (!tiktok || !tiktok.connected || !tiktok.accessToken) return accounts

  const lastUpdated = tiktok.updatedAt ? new Date(tiktok.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (tiktok.followers > 0 && !isOld) return accounts

  try {
    const { fetchTikTokStats } = await import("@/lib/social-service")
    const stats = await fetchTikTokStats(tiktok.accessToken)
    if (!stats) return accounts

    const updatedAt = new Date().toISOString()
    const updatedTikTok = { ...tiktok, ...stats, updatedAt }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.tiktok.followers": stats.followers,
        "accounts.tiktok.posts": stats.posts,
        "accounts.tiktok.likes": stats.likes,
        "accounts.tiktok.updatedAt": updatedAt,
        updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "tiktok.followers": stats.followers,
        "tiktok.posts": stats.posts,
        "tiktok.likes": stats.likes,
        "tiktok.updatedAt": updatedAt,
      })
    }
    return { ...accounts, tiktok: updatedTikTok }
  } catch (err) {
    console.warn("hydrateTikTokStats failed:", err)
    return accounts
  }
}

async function hydrateInstagramStats(accounts: any, workspaceId?: string, userId?: string) {
  const instagram = accounts?.instagram
  if (!instagram || !instagram.connected || !instagram.accessToken || !instagram.id) return accounts

  const lastUpdated = instagram.updatedAt ? new Date(instagram.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (instagram.followers > 0 && !isOld) return accounts

  try {
    const { fetchInstagramStats } = await import("@/lib/social-service")
    const stats = await fetchInstagramStats(instagram.accessToken, instagram.id)
    if (!stats) return accounts

    const updatedAt = new Date().toISOString()
    const updatedInstagram = { ...instagram, ...stats, updatedAt }

    if (workspaceId) {
      const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
      await updateDoc(workspaceRef, {
        "accounts.instagram.followers": stats.followers,
        "accounts.instagram.posts": stats.posts,
        "accounts.instagram.updatedAt": updatedAt,
        updatedAt,
      })
    } else if (userId) {
      const userRef = doc(firebaseDb!, "users", userId)
      await updateDoc(userRef, {
        "instagram.followers": stats.followers,
        "instagram.posts": stats.posts,
        "instagram.updatedAt": updatedAt,
      })
    }
    return { ...accounts, instagram: updatedInstagram }
  } catch (err) {
    console.warn("hydrateInstagramStats failed:", err)
    return accounts
  }
}

async function hydrateFacebookFollowers(accounts: any, workspaceId?: string, userId?: string) {
  const facebook = accounts?.facebook
  if (!facebook || !facebook.connected) return accounts

  const currentFollowers = Number(facebook.followers || 0)
  const token = facebook.accessToken || facebook.access_token
  const pageId = facebook.id

  if (!token || !pageId) return accounts

  const lastUpdated = facebook.updatedAt ? new Date(facebook.updatedAt).getTime() : 0
  const isOld = Date.now() - lastUpdated > 3600000 // 1 hour

  if (currentFollowers > 0 && !isOld) return accounts

  try {
    const { config } = await import("@/lib/config")
    const response = await fetch(
      `https://graph.facebook.com/v${config.facebook.apiVersion}/${pageId}?fields=followers_count,fan_count&access_token=${token}`
    )

    if (!response.ok) return accounts

    const data = await response.json()
    const followers = data.followers_count ?? data.fan_count ?? 0

    if (followers === 0 && currentFollowers > 0 && !isOld) return accounts

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
      bluesky: null,
    }

    // Use workspace accounts if a workspace is active
    const workspace = await getActiveWorkspace(uid)

    if (workspace) {
      const workspaceAccounts = workspace.accounts || {}
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
        bluesky: normalizeAccount(workspaceAccounts.bluesky),
      }
      const withThreads = await hydrateThreadsFollowers(normalized, workspace.id, uid)
      const withLinkedIn = await hydrateLinkedInFollowers(withThreads, workspace.id, uid)
      const withPinterest = await hydratePinterestFollowers(withLinkedIn, workspace.id, uid)
      const withFacebook = await hydrateFacebookFollowers(withPinterest, workspace.id, uid)
      const withYouTube = await hydrateYouTubeStats(withFacebook, workspace.id, uid)
      const withTikTok = await hydrateTikTokStats(withYouTube, workspace.id, uid)
      return await hydrateInstagramStats(withTikTok, workspace.id, uid)
    }

    // Fallback for legacy data stored directly in users/{uid} (only if no workspace exists)
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
      bluesky: normalizeAccount(userData.bluesky),
    }
    const withThreads = await hydrateThreadsFollowers(normalized, undefined, uid)
    const withLinkedIn = await hydrateLinkedInFollowers(withThreads, undefined, uid)
    const withPinterest = await hydratePinterestFollowers(withLinkedIn, undefined, uid)
    const withFacebook = await hydrateFacebookFollowers(withPinterest, undefined, uid)
    const withYouTube = await hydrateYouTubeStats(withFacebook, undefined, uid)
    const withTikTok = await hydrateTikTokStats(withYouTube, undefined, uid)
    return await hydrateInstagramStats(withTikTok, undefined, uid)
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
