import { firebaseDb } from "./firebase-client"
import { collection, getDocs, getDoc, updateDoc, doc, query, where } from "firebase/firestore"
import { config } from "./config"

// Function to check for scheduled posts that need to be published
export async function checkScheduledPosts() {
  try {
    if (!firebaseDb) return console.log("Database not initialized")

    const now = new Date().toISOString()

    // Query the posts collection for scheduled posts that are due
    const postsRef = collection(firebaseDb, "posts")
    const q = query(
      postsRef,
      where("status", "==", "scheduled"),
      where("scheduledFor", "<=", now)
    )

    const postsSnapshot = await getDocs(q)

    console.log(`Found ${postsSnapshot.size} posts to publish`)

    // Iterate through each scheduled post
    for (const postDoc of postsSnapshot.docs) {
      const post = postDoc.data()
      // Publish the post
      await publishPost(post.userId, postDoc.id, post)
    }
  } catch (error) {
    console.error("Error checking scheduled posts:", error)
  }
}

// Function to publish a scheduled post
async function publishPost(userId: string, postId: string, post: any) {
  try {
    if (!firebaseDb) throw new Error("Database not initialized")

    // Update the post status to "publishing"
    const postRef = doc(firebaseDb, "posts", postId)
    await updateDoc(postRef, {
      status: "publishing",
      updatedAt: new Date().toISOString()
    })

    // Determine which platforms to publish to (it's an array now)
    const platforms = post.platforms || [post.platform]
    const results: Record<string, any> = {}
    let allSuccessful = true

    for (const platform of platforms) {
      let publishResult

      switch (platform) {
        case "instagram":
          publishResult = await publishToInstagram(userId, post)
          break
        case "youtube":
          publishResult = await publishToYouTube(userId, post)
          break
        case "tiktok":
          publishResult = {
            success: false,
            error: "TikTok integration is currently disabled for publishing",
          }
          break
        default:
          publishResult = {
            success: false,
            error: `Unsupported platform: ${platform}`,
          }
      }

      results[platform] = publishResult
      if (!publishResult.success) allSuccessful = false
    }

    // Update the post with individual platform status and overall status
    if (allSuccessful) {
      await updateDoc(postRef, {
        status: "published",
        publishedAt: new Date().toISOString(),
        platformResults: results,
        error: null
      })
      console.log(`Successfully published post ${postId} to all platforms`)
    } else {
      // If any platform failed, mark as failed overall but store details
      await updateDoc(postRef, {
        status: "failed",
        platformResults: results,
        error: "One or more platforms failed to publish",
      })
      console.error(`Failed to publish post ${postId} to some platforms`)
    }
  } catch (error: any) {
    console.error(`Error publishing post ${postId}:`, error)

    if (!firebaseDb) throw new Error("Database not initialized")
    const postRef = doc(firebaseDb, "posts", postId)
    await updateDoc(postRef, {
      status: "failed",
      error: error.message,
    })
  }
}

// Function to refresh YouTube token
async function refreshYouTubeToken(userId: string, refreshToken: string) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.youtube.clientId,
        client_secret: config.youtube.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error_description || data.error)

    // Update user doc with new access token
    if (firebaseDb) {
      const userDocRef = doc(firebaseDb, "users", userId)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        const userData = userDoc.data()
        await updateDoc(userDocRef, {
          youtube: {
            ...userData.youtube,
            accessToken: data.access_token,
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    return data.access_token
  } catch (error) {
    console.error("Error refreshing YouTube token:", error)
    throw error
  }
}

// Function to publish a post to Instagram
async function publishToInstagram(userId: string, post: any) {
  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) throw new Error("User settings not found")

    const userData = userDoc.data()
    const instagram = userData.instagram

    if (!instagram || !instagram.accessToken) throw new Error("Instagram account not connected")

    const igUserId = instagram.id || instagram.username
    const accessToken = instagram.accessToken

    // 1. Create Media Container
    const containerUrl = `https://graph.facebook.com/v18.0/${igUserId}/media`
    const containerParams: any = {
      caption: post.content || post.description || "",
      access_token: accessToken,
    }

    const isVideo = post.mediaUrl?.match(/\.(mp4|mov|avi|wmv|flv)$/i) || post.contentType === "video"
    if (isVideo) {
      containerParams.video_url = post.mediaUrl
      containerParams.media_type = "VIDEO"
    } else {
      containerParams.image_url = post.mediaUrl
    }

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerParams),
    })

    const containerData = await containerResponse.json()
    if (containerData.error) throw new Error(containerData.error.message)

    const creationId = containerData.id
    if (isVideo) await new Promise(resolve => setTimeout(resolve, 30000))

    // 2. Publish Media
    const publishUrl = `https://graph.facebook.com/v18.0/${igUserId}/media_publish`
    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    })

    const publishData = await publishResponse.json()
    if (publishData.error) throw new Error(publishData.error.message)

    return { success: true, platformId: publishData.id }
  } catch (error: any) {
    console.error("Error publishing to Instagram:", error)
    return { success: false, error: error.message }
  }
}

// Function to publish a post to YouTube
async function publishToYouTube(userId: string, post: any) {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) throw new Error("User settings not found")

    const userData = userDoc.data()
    const youtube = userData.youtube

    if (!youtube || !youtube.accessToken) throw new Error("YouTube account not connected")

    accessToken = youtube.accessToken
    refreshToken = youtube.refreshToken

    async function attemptUpload(token: string) {
      // Step 1: Initialize Resumable Upload
      const initResponse = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": "video/*",
        },
        body: JSON.stringify({
          snippet: {
            title: post.title || post.content?.substring(0, 100) || "Scheduled Post",
            description: post.content || "",
            categoryId: "22",
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false
          },
        }),
      })

      if (initResponse.status === 401 && refreshToken) {
        return { retry: true }
      }

      if (!initResponse.ok) {
        const err = await initResponse.json().catch(() => ({}))
        throw new Error(`YouTube API Error (Init): ${err.error?.message || initResponse.statusText}`)
      }

      const uploadUrl = initResponse.headers.get("Location")
      if (!uploadUrl) throw new Error("Failed to get YouTube upload URL")

      // Step 2: Upload Video binary
      if (!post.mediaUrl) throw new Error("No media file provided for YouTube upload")

      const mediaResponse = await fetch(post.mediaUrl)
      if (!mediaResponse.ok) throw new Error("Failed to fetch media file from storage")

      const mediaBlob = await mediaResponse.blob()
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "video/*" },
        body: mediaBlob
      })

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json().catch(() => ({}))
        throw new Error(`YouTube API Error (Upload): ${err.error?.message || "Upload failed"}`)
      }

      return await uploadResponse.json()
    }

    if (!accessToken) throw new Error("YouTube access token missing")
    let result = await attemptUpload(accessToken)

    // If unauthorized, try refreshing token once
    if (result.retry && refreshToken) {
      console.log("YouTube token expired, refreshing...")
      accessToken = await refreshYouTubeToken(userId, refreshToken)
      if (!accessToken) throw new Error("Failed to refresh YouTube access token")
      result = await attemptUpload(accessToken)
    }

    return {
      success: true,
      platformId: result.id,
    }

  } catch (error: any) {
    console.error("Error publishing to YouTube:", error)
    return { success: false, error: error.message }
  }
}