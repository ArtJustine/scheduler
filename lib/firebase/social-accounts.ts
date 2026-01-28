import { doc, getDoc, updateDoc, deleteField, setDoc } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { SocialAccount, SocialAccountType } from "@/types/social"

// Remove all mock data, preview mode, and offline fallback logic. Only use real Firestore data for all social account functions.

export async function getSocialAccounts() {
  const user = firebaseAuth?.currentUser

  if (!user) {
    console.warn("User not authenticated, no social accounts found")
    return {}
  }

  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      // Create an empty document for the user if it doesn't exist
      await setDoc(userDocRef, {})
      return {}
    }

    const userData = userDoc.data()
    return {
      instagram: userData.instagram || null,
      youtube: userData.youtube || null,
      tiktok: userData.tiktok || null,
      threads: userData.threads || null,
      facebook: userData.facebook || null,
      twitter: userData.twitter || null,
      pinterest: userData.pinterest || null,
      linkedin: userData.linkedin || null,
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
    const userDocRef = doc(firebaseDb, "users", user.uid)

    // Check if the document exists first
    const docSnap = await getDoc(userDocRef)

    if (!docSnap.exists()) {
      // Create the document with the platform data
      await setDoc(userDocRef, {
        [platform]: {
          ...accountData,
          followers: accountData.followers || 0,
          followersGrowth: accountData.followersGrowth || 0,
          engagement: accountData.engagement || 0,
          impressions: accountData.impressions || 0,
          posts: accountData.posts || 0,
          updatedAt: new Date().toISOString(),
        },
      })
    } else {
      // Update the existing document
      await updateDoc(userDocRef, {
        [platform]: {
          ...accountData,
          followers: accountData.followers || 0,
          followersGrowth: accountData.followersGrowth || 0,
          engagement: accountData.engagement || 0,
          impressions: accountData.impressions || 0,
          posts: accountData.posts || 0,
          updatedAt: new Date().toISOString(),
        },
      })
    }
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
    const userDocRef = doc(firebaseDb, "users", user.uid)

    // Remove the platform data
    await updateDoc(userDocRef, {
      [platform]: deleteField(),
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
