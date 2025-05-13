import { doc, getDoc, updateDoc, deleteField, setDoc } from "firebase/firestore"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import type { SocialAccount, SocialAccountType } from "@/types/social"

// Mock data for offline scenarios
const MOCK_ACCOUNTS = {
  instagram: {
    username: "demo_instagram",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 1250,
    followersGrowth: 5.2,
    engagement: 3.8,
    impressions: 4500,
    posts: 42,
    updatedAt: new Date().toISOString(),
  },
  youtube: {
    username: "demo_youtube",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 3800,
    followersGrowth: 2.7,
    engagement: 4.5,
    impressions: 12000,
    posts: 28,
    updatedAt: new Date().toISOString(),
  },
  tiktok: {
    username: "demo_tiktok",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 5600,
    followersGrowth: 8.3,
    engagement: 6.2,
    impressions: 25000,
    posts: 35,
    updatedAt: new Date().toISOString(),
  },
}

// Helper function to check if Firestore is available
const isFirestoreAvailable = () => {
  return typeof window !== "undefined" && firebaseDb !== undefined
}

// Helper function to check if we're in demo/preview mode
const isPreviewMode = () => {
  return (
    process.env.NODE_ENV === "development" && typeof window !== "undefined" && window.location.hostname === "localhost"
  )
}

export async function getSocialAccounts() {
  // If we're in preview mode, return mock data
  if (isPreviewMode()) {
    console.log("Using mock data for preview mode")
    return MOCK_ACCOUNTS
  }

  // Check if we're in the browser and Firestore is available
  if (!isFirestoreAvailable()) {
    console.warn("Firestore is not available, using mock data")
    return MOCK_ACCOUNTS
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    console.warn("User not authenticated, using mock data")
    return MOCK_ACCOUNTS
  }

  try {
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
    }
  } catch (error) {
    console.error("Error getting social accounts:", error)

    // If we get an offline error, return mock data
    if (error.message?.includes("offline")) {
      console.log("Client is offline, using mock data")
      return MOCK_ACCOUNTS
    }

    // Return empty object as fallback
    return {}
  }
}

export async function connectSocialAccount(platform: SocialAccountType, accountData: SocialAccount) {
  // If we're in preview mode, just return success
  if (isPreviewMode()) {
    console.log(`Mock connecting ${platform} account in preview mode`)
    return
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
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
  // If we're in preview mode, just return success
  if (isPreviewMode()) {
    console.log(`Mock disconnecting ${platform} account in preview mode`)
    return
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
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
  // If we're in preview mode, just return success
  if (isPreviewMode()) {
    console.log(`Mock updating ${platform} account stats in preview mode`)
    return
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
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
  // If we're in preview mode, just return a mock token
  if (isPreviewMode()) {
    console.log(`Mock refreshing ${platform} token in preview mode`)
    return `mock_refreshed_token_${Date.now()}`
  }

  if (!isFirestoreAvailable()) {
    throw new Error("Firestore is not available")
  }

  const user = firebaseAuth?.currentUser

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
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
