
import { adminDb } from "./firebase-admin"
import { config } from "./config"

// Function to check for scheduled posts that need to be published
export async function checkScheduledPosts() {
  try {
    if (!adminDb) return console.log("Database not initialized")

    const now = new Date().toISOString()

    // Query the posts collection for scheduled posts
    // We filter by date in memory to avoid needing a composite index on [status, scheduledFor]
    const postsRef = adminDb.collection("posts")
    const snapshot = await postsRef
      .where("status", "==", "scheduled")
      .get()

    console.log(`Found ${snapshot.size} scheduled posts total`)

    // Iterate through each scheduled post
    for (const doc of snapshot.docs) {
      const post = doc.data()
      // Check time client-side (server-side logic but not DB query)
      if (post.scheduledFor <= now) {
        console.log(`Publishing due post: ${doc.id}`)
        await publishPost(post.userId, doc.id, post)
      }
    }
  } catch (error) {
    console.error("Error checking scheduled posts:", error)
  }
}

// Function to publish a scheduled post
export async function publishPost(userId: string, postId: string, post: any) {
  try {
    if (!adminDb) throw new Error("Database not initialized")

    // Update the post status to "publishing"
    const postRef = adminDb.collection("posts").doc(postId)
    await postRef.update({
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
          publishResult = await publishToTikTok(userId, post)
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
      await postRef.update({
        status: "published",
        publishedAt: new Date().toISOString(),
        platformResults: results,
        error: null
      })
      console.log(`Successfully published post ${postId} to all platforms`)
    } else {
      // Extract the first error message to show to the user
      const firstError = Object.values(results).find(r => !r.success)?.error || "One or more platforms failed to publish"

      // If any platform failed, mark as failed overall but store details
      await postRef.update({
        status: "failed",
        platformResults: results,
        error: firstError,
      })
      console.error(`Failed to publish post ${postId} to some platforms: ${firstError}`)
    }
  } catch (error: any) {
    console.error(`Error publishing post ${postId}:`, error)

    if (!adminDb) throw new Error("Database not initialized")
    const postRef = adminDb.collection("posts").doc(postId)
    await postRef.update({
      status: "failed",
      error: error.message,
    })
  }
}

// Function to refresh TikTok token
async function refreshTikTokToken(userId: string, refreshToken: string) {
  try {
    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: config.tiktok.clientKey,
        client_secret: config.tiktok.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error_description || data.error)

    // Update user doc with new access token
    if (adminDb) {
      const userRef = adminDb.collection("users").doc(userId)
      const userDoc = await userRef.get()

      if (userDoc.exists) {
        const userData = userDoc.data()
        if (userData) {
          await userRef.update({
            tiktok: {
              ...userData.tiktok,
              accessToken: data.access_token,
              refreshToken: data.refresh_token || refreshToken, // TikTok sometimes returns a new refresh token
              updatedAt: new Date().toISOString()
            }
          })
        }
      }
    }

    return data.access_token
  } catch (error) {
    console.error("Error refreshing TikTok token:", error)
    throw error
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
    if (adminDb) {
      const userRef = adminDb.collection("users").doc(userId)
      const userDoc = await userRef.get()

      if (userDoc.exists) {
        const userData = userDoc.data()
        if (userData) {
          await userRef.update({
            youtube: {
              ...userData.youtube,
              accessToken: data.access_token,
              updatedAt: new Date().toISOString()
            }
          })
        }
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
    if (!adminDb) throw new Error("Database not initialized")
    const userRef = adminDb.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) throw new Error("User settings not found")

    const userData = userDoc.data()
    const instagram = userData?.instagram

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
    if (!adminDb) throw new Error("Database not initialized")
    const userRef = adminDb.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) throw new Error("User settings not found")

    const userData = userDoc.data()
    const youtube = userData?.youtube

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
            categoryId: post.youtubeOptions?.category || "22",
            tags: post.youtubeOptions?.tags || [],
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: post.youtubeOptions?.madeForKids || false
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

    if (result.retry) {
      throw new Error("YouTube API returned 401 Unauthorized even after token refresh")
    }

    if (!result.id) {
      throw new Error("YouTube API call succeeded but returned no video ID")
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

// Function to publish a post to TikTok
async function publishToTikTok(userId: string, post: any) {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  try {
    if (!adminDb) throw new Error("Database not initialized")
    const userRef = adminDb.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) throw new Error("User settings not found")

    const userData = userDoc.data()
    const tiktok = userData?.tiktok

    if (!tiktok || !tiktok.accessToken) throw new Error("TikTok account not connected")

    accessToken = tiktok.accessToken
    refreshToken = tiktok.refreshToken

    async function attemptPublish(token: string) {
      // Switch to FILE_UPLOAD to bypass TikTok domain verification requirements
      // Documentation: https://developers.tiktok.com/doc/content-posting-api-v2-direct-post/

      if (!post.mediaUrl) throw new Error("No media URL provided for TikTok upload")

      // 1. Fetch the media to get its size and data
      console.log("Fetching media from Firebase for TikTok upload:", post.mediaUrl)
      const mediaResponse = await fetch(post.mediaUrl)
      if (!mediaResponse.ok) throw new Error("Failed to fetch media file from storage")

      const mediaBlob = await mediaResponse.blob()
      const videoSize = mediaBlob.size
      console.log(`Video size detected: ${videoSize} bytes`)

      // 2. Initialize the upload
      const publishUrl = "https://open.tiktokapis.com/v2/post/publish/video/init/"
      const initBody = {
        post_info: {
          title: post.title || post.content?.substring(0, 80) || "Scheduled Post",
          privacy_level: "MUTUAL_FOLLOW_FRIENDS", // Alternative for sandbox restriction testing
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
          video_ad_tag: false
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize, // Sending as a single chunk for simplicity
          total_chunk_count: 1
        }
      }

      const initResponse = await fetch(publishUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initBody),
      })

      if (initResponse.status === 401 && refreshToken) {
        return { retry: true }
      }

      const initData = await initResponse.json()
      console.log("TikTok Init Response:", JSON.stringify(initData))

      if (initData.error && initData.error.code !== "ok" && initData.error.code !== 0) {
        throw new Error(`TikTok API Error (${initData.error.code}): ${initData.error.message || "Init failed"}`)
      }

      const uploadUrl = initData.data.upload_url
      if (!uploadUrl) throw new Error("No upload URL returned from TikTok")

      // 3. Perform the actual binary upload
      console.log("Uploading bytes to TikTok...")
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4", // Most TikToks are mp4
          "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`
        },
        body: mediaBlob
      })

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text()
        console.error("TikTok Upload Error Body:", errText)
        throw new Error(`TikTok binary upload failed: ${uploadResponse.statusText}`)
      }

      return initData.data
    }

    if (!accessToken) throw new Error("TikTok access token missing")
    let result = await attemptPublish(accessToken)

    // If unauthorized, try refreshing token once
    if (result && result.retry && refreshToken) {
      console.log("TikTok token expired, refreshing...")
      accessToken = await refreshTikTokToken(userId, refreshToken)
      if (!accessToken) throw new Error("Failed to refresh TikTok access token")
      result = await attemptPublish(accessToken)
    }

    if (result && result.retry) {
      throw new Error("TikTok API returned 401 Unauthorized even after token refresh")
    }

    if (!result || !result.publish_id) {
      throw new Error("TikTok API call succeeded but returned no publish ID")
    }

    return {
      success: true,
      platformId: result.publish_id,
    }

  } catch (error: any) {
    console.error("Error publishing to TikTok:", error)
    return { success: false, error: error.message }
  }
}