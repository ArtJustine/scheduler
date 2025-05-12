import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore"
import { db, auth } from "./config"
import type { SocialAccount, SocialAccountType } from "@/types/social"

export async function getSocialAccounts() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const userDocRef = doc(db, "users", user.uid)
  const userDoc = await getDoc(userDocRef)

  if (!userDoc.exists()) {
    return {}
  }

  const userData = userDoc.data()
  return {
    instagram: userData.instagram || null,
    youtube: userData.youtube || null,
    tiktok: userData.tiktok || null,
  }
}

export async function connectSocialAccount(platform: SocialAccountType, accountData: SocialAccount) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const userDocRef = doc(db, "users", user.uid)

  // Store the connection data
  await updateDoc(userDocRef, {
    [platform]: {
      ...accountData,
      // Add placeholder stats if connecting for the first time
      followers: accountData.followers || 0,
      followersGrowth: accountData.followersGrowth || 0,
      engagement: accountData.engagement || 0,
      impressions: accountData.impressions || 0,
      posts: accountData.posts || 0,
      updatedAt: new Date().toISOString(),
    },
  })
}

export async function disconnectSocialAccount(platform: SocialAccountType) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const userDocRef = doc(db, "users", user.uid)

  // Remove the platform data
  await updateDoc(userDocRef, {
    [platform]: deleteField(),
  })
}

export async function updateSocialAccountStats(platform: SocialAccountType, stats: Partial<SocialAccount>) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const userDocRef = doc(db, "users", user.uid)
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
}

// This function would be used in a real implementation to refresh expired tokens
export async function refreshSocialToken(platform: SocialAccountType) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  const userDocRef = doc(db, "users", user.uid)
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
}
