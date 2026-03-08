
import { adminDb } from "./firebase-admin"
import { config } from "./config"

// Function to check for scheduled posts that need to be published
export async function checkScheduledPosts() {
  console.log("checkScheduledPosts: Initializing...")
  try {
    if (!adminDb) {
      console.error("checkScheduledPosts: Database (adminDb) is null or undefined!")
      return
    }

    const now = new Date().toISOString()
    console.log(`checkScheduledPosts: Current time (UTC): ${now}`)

    // Query the posts collection for scheduled posts
    const postsRef = adminDb.collection("posts")
    console.log("checkScheduledPosts: Querying Firestore for status == 'scheduled'...")
    const snapshot = await postsRef
      .where("status", "==", "scheduled")
      .get()

    console.log(`checkScheduledPosts: Found ${snapshot.size} total posts with status 'scheduled'`)

    let processedCount = 0
    let publishedCount = 0

    // Iterate through each scheduled post
    for (const doc of snapshot.docs) {
      const post = doc.data()
      console.log(`checkScheduledPosts: Analyzing post ${doc.id} | Scheduled for: ${post.scheduledFor}`)

      // Check time client-side
      if (post.scheduledFor <= now) {
        console.log(`checkScheduledPosts: Post ${doc.id} is due for publishing!`)
        processedCount++
        try {
          await publishPost(post.userId, doc.id, post)
          publishedCount++
        } catch (publishErr) {
          console.error(`checkScheduledPosts: Failed to publish post ${doc.id}:`, publishErr)
        }
      } else {
        console.log(`checkScheduledPosts: Post ${doc.id} is scheduled for the future (${post.scheduledFor}). Skipping.`)
      }
    }

    console.log(`checkScheduledPosts: Finished. Processed ${processedCount} due posts, ${publishedCount} succeeded.`)
  } catch (error) {
    console.error("checkScheduledPosts: Critical error:", error)
    throw error // Re-throw so the API returns 500
  }
}
// Helper to get platform credentials (workspace-aware)
async function getSocialData(userId: string, workspaceId: string | undefined, platform: string) {
  if (!adminDb) return null

  if (workspaceId) {
    const workspaceDoc = await adminDb.collection("workspaces").doc(workspaceId).get()
    if (workspaceDoc.exists) {
      const data = workspaceDoc.data()
      return data?.accounts?.[platform]
    }
  }

  // Legacy/Fallback to user document
  const userDoc = await adminDb.collection("users").doc(userId).get()
  return userDoc.exists ? userDoc.data()?.[platform] : null
}

// Helper to update platform credentials
async function updateSocialData(userId: string, workspaceId: string | undefined, platform: string, update: any) {
  if (!adminDb) return

  if (workspaceId) {
    const workspaceRef = adminDb.collection("workspaces").doc(workspaceId)
    await workspaceRef.update({
      [`accounts.${platform}`]: update,
      updatedAt: new Date().toISOString()
    })
  } else {
    // Legacy fallback
    const userRef = adminDb.collection("users").doc(userId)
    await userRef.update({
      [platform]: update,
      updatedAt: new Date().toISOString()
    })
  }
}

// Function to publish a scheduled post
export async function publishPost(userId: string, postId: string, post: any) {
  console.log(`publishPost: Starting for post ${postId} (user: ${userId})`)
  try {
    if (!adminDb) throw new Error("Database not initialized")

    const postRef = adminDb.collection("posts").doc(postId)
    await postRef.update({
      status: "publishing",
      updatedAt: new Date().toISOString()
    })

    const platforms: string[] = post.platforms || (post.platform ? [post.platform] : [])
    const results: Record<string, any> = {}

    // Pre-fetch media if needed by platforms that require binary data
    let sharedMediaBlob: Blob | null = null
    const needsBinaryMedia = platforms.some(p => ["youtube", "tiktok", "linkedin", "pinterest"].includes(p))

    if (needsBinaryMedia && post.mediaUrl) {
      console.log(`publishPost: Pre-fetching media for platforms: ${post.mediaUrl}`)
      try {
        const mediaRes = await fetch(post.mediaUrl)
        if (mediaRes.ok) {
          sharedMediaBlob = await mediaRes.blob()
          console.log(`publishPost: Media fetched successfully (${sharedMediaBlob.size} bytes)`)
        } else {
          console.error(`publishPost: Failed to fetch media: ${mediaRes.statusText}`)
        }
      } catch (err) {
        console.error(`publishPost: Error fetching shared media:`, err)
      }
    }

    // Process platforms SEQUENTIALLY to stay within memory limits and provide per-platform status
    let successCount = 0
    let failureCount = 0

    for (const platform of platforms) {
      console.log(`publishPost: Processing ${platform}...`)
      try {
        let result: any
        switch (platform) {
          case "instagram":
            result = await publishToInstagram(userId, post)
            break
          case "youtube":
            result = await publishToYouTube(userId, post, sharedMediaBlob)
            break
          case "tiktok":
            result = await publishToTikTok(userId, post, sharedMediaBlob)
            break
          case "threads":
            result = await publishToThreads(userId, post)
            break
          case "linkedin":
            result = await publishToLinkedIn(userId, post, sharedMediaBlob)
            break
          case "facebook":
            result = await publishToFacebook(userId, post)
            break
          case "pinterest":
            result = await publishToPinterest(userId, post, sharedMediaBlob)
            break
          case "bluesky":
            result = await publishToBluesky(userId, post)
            break
          default:
            result = { success: false, error: `Unsupported platform: ${platform}` }
        }

        results[platform] = result
        if (result.success) {
          successCount++
        } else {
          failureCount++
        }

        // Update progress in DB after each platform for better tracking
        await postRef.update({
          platformResults: results,
          updatedAt: new Date().toISOString()
        })

      } catch (err: any) {
        console.error(`publishPost: Error processing ${platform}:`, err)
        results[platform] = { success: false, error: err.message || "Unknown execution error" }
        failureCount++
      }
    }

    // Final Status Update
    if (failureCount === 0) {
      await postRef.update({
        status: "published",
        publishedAt: new Date().toISOString(),
        platformResults: results,
        error: null
      })
      console.log(`Successfully published post ${postId} to all platforms`)
    } else if (successCount > 0) {
      const failedList = Object.entries(results)
        .filter(([, r]: [string, any]) => !r.success)
        .map(([p, r]: [string, any]) => `${p}: ${r.error}`)
        .join("; ")
      await postRef.update({
        status: "partial",
        publishedAt: new Date().toISOString(),
        platformResults: results,
        error: `Partial success. Failures: ${failedList}`
      })
      console.warn(`Partially published post ${postId}.`)
    } else {
      const firstError = Object.values(results).find(r => !r.success)?.error || "All platforms failed"
      await postRef.update({
        status: "failed",
        platformResults: results,
        error: firstError,
      })
      console.error(`Failed to publish post ${postId}: ${firstError}`)
    }
  } catch (error: any) {
    console.error(`Error in publishPost for ${postId}:`, error)
    if (adminDb) {
      await adminDb.collection("posts").doc(postId).update({
        status: "failed",
        error: error.message,
        updatedAt: new Date().toISOString()
      })
    }
  }
}

// Function to refresh TikTok token
async function refreshTikTokToken(userId: string, workspaceId: string | undefined, refreshToken: string) {
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

    const existingData = await getSocialData(userId, workspaceId, "tiktok")
    if (existingData) {
      await updateSocialData(userId, workspaceId, "tiktok", {
        ...existingData,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        updatedAt: new Date().toISOString()
      })
    }

    return data.access_token
  } catch (error) {
    console.error("Error refreshing TikTok token:", error)
    throw error
  }
}

// Function to refresh YouTube token
async function refreshYouTubeToken(userId: string, workspaceId: string | undefined, refreshToken: string) {
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

    const existingData = await getSocialData(userId, workspaceId, "youtube")
    if (existingData) {
      await updateSocialData(userId, workspaceId, "youtube", {
        ...existingData,
        accessToken: data.access_token,
        updatedAt: new Date().toISOString()
      })
    }

    return data.access_token
  } catch (error) {
    console.error("Error refreshing YouTube token:", error)
    throw error
  }
}

// Function to refresh LinkedIn token
async function refreshLinkedInToken(userId: string, workspaceId: string | undefined, refreshToken: string) {
  try {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.linkedin.clientId,
        client_secret: config.linkedin.clientSecret,
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error_description || data.error)

    const existingData = await getSocialData(userId, workspaceId, "linkedin")
    if (existingData) {
      await updateSocialData(userId, workspaceId, "linkedin", {
        ...existingData,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : existingData.expiresAt,
        updatedAt: new Date().toISOString()
      })
    }

    return data.access_token
  } catch (error) {
    console.error("Error refreshing LinkedIn token:", error)
    throw error
  }
}

// Function to publish a post to Instagram
async function publishToInstagram(userId: string, post: any) {
  try {
    const instagram = await getSocialData(userId, post.workspaceId, "instagram")
    if (!instagram || !instagram.accessToken) throw new Error("Instagram account not connected")

    if (!post.mediaUrl) {
      return { success: false, error: "Instagram requires an image or video." }
    }

    const igUserId = instagram.id
    if (!igUserId || igUserId.startsWith("unknown_")) {
      throw new Error("Instagram Business ID missing. Please reconnect your account and ensure your Instagram account is a Business account linked to a Facebook Page.")
    }
    const accessToken = instagram.accessToken

    // 1. Create Media Container
    const containerUrl = `https://graph.facebook.com/v${config.instagram.apiVersion}/${igUserId}/media`
    const isVideo = post.contentType === "video" || post.mediaUrl?.match(/\.(mp4|mov|avi|wmv|flv)$/i)

    const containerParams: any = {
      caption: post.content || post.description || "",
      access_token: accessToken,
    }

    if (isVideo) {
      containerParams.video_url = post.mediaUrl
      // Explicitly support Reels if selected
      if (post.instagramPostType === "reel") {
        containerParams.media_type = "REELS"
        containerParams.share_to_feed = true // Ensure it appears on the grid
      } else {
        containerParams.media_type = "VIDEO"
      }
    } else {
      containerParams.image_url = post.mediaUrl
      containerParams.media_type = "IMAGE"
    }

    console.log(`Instagram: Creating container (${containerParams.media_type})...`)
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerParams),
    })

    const containerData = await containerRes.json()
    if (containerData.error) {
      console.error("Instagram container error:", containerData.error)
      throw new Error(containerData.error.message || "Failed to create media container")
    }

    const creationId = containerData.id

    // 2. Poll for Status (Optimized)
    let isReady = false
    let attempts = 0
    const maxAttempts = 15 // Wait up to ~75 seconds 
    let lastStatus = "UNKNOWN"

    console.log(`Instagram: Waiting for media ${creationId} to process...`)

    while (!isReady && attempts < maxAttempts) {
      // Sleep at the START of the loop to allow processing time (5s)
      await new Promise(resolve => setTimeout(resolve, 5000))

      const statusRes = await fetch(`https://graph.facebook.com/v${config.instagram.apiVersion}/${creationId}?fields=status_code,status,error_message&access_token=${accessToken}`)
      const statusData = await statusRes.json()

      if (statusData.error) {
        console.error("Instagram status check error:", JSON.stringify(statusData.error))
        throw new Error(`Meta API Status Error: ${statusData.error.message}`)
      }

      lastStatus = statusData.status_code || statusData.status
      console.log(`Instagram status check (${attempts + 1}/${maxAttempts}): ${lastStatus}`)

      if (lastStatus === "FINISHED") {
        isReady = true
      } else if (lastStatus === "ERROR") {
        throw new Error(`Instagram processing failed: ${statusData.error_message || "Video processing error (likely codec or size issue)"}`)
      } else if (lastStatus === "EXPIRED") {
        throw new Error("Instagram media container expired before it could be published.")
      }

      attempts++
    }

    if (!isReady) throw new Error("Instagram timed out waiting for media to process.")

    // 3. Publish Media
    console.log(`Instagram: Publishing media ${creationId}...`)
    const publishRes = await fetch(`https://graph.facebook.com/v${config.instagram.apiVersion}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    })

    const publishData = await publishRes.json()
    if (publishData.error) throw new Error(publishData.error.message)

    return { success: true, platformId: publishData.id }
  } catch (error: any) {
    console.error("Error publishing to Instagram:", error)
    return { success: false, error: error.message || "Unknown Instagram error" }
  }
}

// Function to publish a post to YouTube
async function publishToYouTube(userId: string, post: any, preFetchedBlob: Blob | null = null) {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  try {
    const youtube = await getSocialData(userId, post.workspaceId, "youtube")
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
      let mediaBlob = preFetchedBlob
      if (!mediaBlob) {
        if (!post.mediaUrl) throw new Error("No media file provided for YouTube upload")
        console.log("YouTube: Fetching media blob (not pre-fetched)...")
        const mediaRes = await fetch(post.mediaUrl)
        if (!mediaRes.ok) throw new Error("Failed to fetch media file from storage")
        mediaBlob = await mediaRes.blob()
      }

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
      accessToken = await refreshYouTubeToken(userId, post.workspaceId, refreshToken)
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
async function publishToTikTok(userId: string, post: any, preFetchedBlob: Blob | null = null) {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  try {
    const tiktok = await getSocialData(userId, post.workspaceId, "tiktok")
    if (!tiktok || !tiktok.accessToken) throw new Error("TikTok account not connected")

    accessToken = tiktok.accessToken
    refreshToken = tiktok.refreshToken

    async function attemptPublish(token: string) {
      if (!post.mediaUrl && !preFetchedBlob) throw new Error("No media provided for TikTok upload")

      // 1. Get the media blob
      let mediaBlob = preFetchedBlob
      if (!mediaBlob) {
        console.log("TikTok: Fetching media from Firebase (not pre-fetched):", post.mediaUrl)
        const mediaRes = await fetch(post.mediaUrl)
        if (!mediaRes.ok) throw new Error("Failed to fetch media file from storage")
        mediaBlob = await mediaRes.blob()
      }

      const videoSize = mediaBlob.size
      console.log(`TikTok: Video size detected: ${videoSize} bytes`)

      // 2. Initialize the upload
      const initUrl = "https://open.tiktokapis.com/v2/post/publish/video/init/"
      const initBody = {
        post_info: {
          title: post.title || post.content?.substring(0, 80) || "Scheduled Post",
          privacy_level: post.tiktokOptions?.privacy === "public" ? "PUBLIC_TO_EVERYONE" :
            post.tiktokOptions?.privacy === "friends" ? "FRIENDS" : "SELF_ONLY",
          disable_comment: post.tiktokOptions?.allowComments === false,
          disable_duet: post.tiktokOptions?.allowDuet === false,
          disable_stitch: post.tiktokOptions?.allowStitch === false,
          video_ad_tag: false
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize,
          total_chunk_count: 1
        }
      }

      console.log("TikTok: Initializing upload...")
      const initRes = await fetch(initUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initBody),
      })

      if (initRes.status === 401 && refreshToken) {
        return { retry: true }
      }

      const initData = await initRes.json()
      console.log("TikTok Init Response:", JSON.stringify(initData))

      // Check for errors in initData.error (v2 format)
      const errorCode = initData.error?.code
      if (errorCode !== undefined && errorCode !== "ok" && errorCode !== 0 && errorCode !== "0") {
        throw new Error(`TikTok API Error (${errorCode}): ${initData.error.message || "Init failed"}`)
      }

      const uploadUrl = initData.data?.upload_url
      if (!uploadUrl) {
        throw new Error(`TikTok failed to provide upload URL. Response: ${JSON.stringify(initData)}`)
      }

      // 3. Perform the actual binary upload
      let contentType = mediaBlob.type
      if (!contentType || contentType === "application/octet-stream") {
        contentType = "video/mp4" // Standard fallback for TikTok
      }
      console.log(`TikTok: Uploading binary data (Size: ${videoSize}, Type: ${contentType})...`)

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`
        },
        body: mediaBlob
      })

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => "Unknown upload error")
        console.error("TikTok Binary Upload Error:", errText)
        throw new Error(`TikTok binary upload failed (${uploadRes.status}): ${errText || uploadRes.statusText}`)
      }

      console.log("TikTok: Binary upload completed successfully.")
      return initData.data
    }

    if (!accessToken) throw new Error("TikTok access token missing")
    let result = await attemptPublish(accessToken)

    // If unauthorized, try refreshing token once
    if (result && result.retry && refreshToken) {
      console.log("TikTok token expired, refreshing...")
      accessToken = await refreshTikTokToken(userId, post.workspaceId, refreshToken)
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

// Function to publish a post to Threads
async function publishToThreads(userId: string, post: any) {
  try {
    const threads = await getSocialData(userId, post.workspaceId, "threads")
    if (!threads || !threads.accessToken) throw new Error("Threads account not connected")

    const threadsUserId = threads.id || threads.username
    const accessToken = threads.accessToken

    // 1. Create Media Container
    // If it's just text, media_type = TEXT
    // If image, media_type = IMAGE
    // If video, media_type = VIDEO

    let containerUrl = `https://graph.threads.net/v1.0/${threadsUserId}/threads`
    let containerParams: any = {
      text: post.content || post.description || "",
      access_token: accessToken,
    }

    const isVideo = post.mediaUrl?.match(/\.(mp4|mov|avi|wmv|flv)$/i) || post.contentType === "video"
    const isImage = post.mediaUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) || post.contentType === "image"

    if (isVideo) {
      containerParams.media_type = "VIDEO"
      containerParams.video_url = post.mediaUrl
    } else if (isImage) {
      containerParams.media_type = "IMAGE"
      containerParams.image_url = post.mediaUrl
    } else {
      containerParams.media_type = "TEXT"
    }

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerParams),
    })

    const containerData = await containerResponse.json()
    if (containerData.error) {
      throw new Error(containerData.error.message || "Failed to create Threads container")
    }

    const creationId = containerData.id

    // For videos, we might need to wait for processing
    if (isVideo) {
      let status = "IN_PROGRESS"
      let attempts = 0
      while ((status === "IN_PROGRESS" || status === "STARTED") && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        const statusResponse = await fetch(`https://graph.threads.net/v1.0/${creationId}?fields=status,error_message&access_token=${accessToken}`)
        const statusData = await statusResponse.json()
        status = statusData.status
        if (status === "FINISHED") break
        if (status === "ERROR") throw new Error(statusData.error_message || "Video processing failed")
        attempts++
      }
    } else {
      // Small delay for images just in case
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // 2. Publish Media
    const publishUrl = `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`
    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    })

    const publishData = await publishResponse.json()
    if (publishData.error) {
      throw new Error(publishData.error.message || "Failed to publish Threads post")
    }

    return { success: true, platformId: publishData.id }
  } catch (error: any) {
    console.error("Error publishing to Threads:", error)
    return { success: false, error: error.message }
  }
}

// Function to publish a post to LinkedIn
async function publishToLinkedIn(userId: string, post: any, preFetchedBlob: Blob | null = null) {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  try {
    const linkedin = await getSocialData(userId, post.workspaceId, "linkedin")
    if (!linkedin || !linkedin.accessToken) throw new Error("LinkedIn account not connected")

    accessToken = linkedin.accessToken
    refreshToken = linkedin.refreshToken
    const personId = linkedin.id

    async function attemptPublish(token: string) {
      const author = `urn:li:person:${personId}`

      let body: any = {
        author: author,
        lifecycleState: "PUBLISHED",
        visibility: "PUBLIC",
      }

      const hasMedia = !!post.mediaUrl
      const isVideo = (post.mediaUrl?.match(/\.(mp4|mov|avi|wmv|flv)$/i) || post.contentType === "video") && hasMedia
      let assetUrn: string | null = null

      if (hasMedia) {
        // Step 1: Register Upload
        const recipe = isVideo ? "urn:li:digitalmediaRecipe:feedshare-video" : "urn:li:digitalmediaRecipe:feedshare-image";
        const registerBody = {
          registerUploadRequest: {
            recipes: [recipe],
            owner: author,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent"
              }
            ]
          }
        };

        const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
          },
          body: JSON.stringify(registerBody)
        });

        if (registerRes.status === 401 && refreshToken) {
          return { retry: true }
        }

        if (!registerRes.ok) {
          const err = await registerRes.json().catch(() => ({}));
          throw new Error(`LinkedIn Media Register Error: ${err.message || registerRes.statusText}`);
        }

        const registerData = await registerRes.json();
        const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
        assetUrn = registerData.value.asset;

        // Step 2: Get media blob
        let mediaBlob = preFetchedBlob
        if (!mediaBlob) {
          if (!post.mediaUrl) throw new Error("No media URL")
          const mediaRes = await fetch(post.mediaUrl);
          if (!mediaRes.ok) throw new Error("Failed to fetch media from storage for LinkedIn upload");
          mediaBlob = await mediaRes.blob();
        }

        // Step 3: Upload binary to LinkedIn
        const contentType = mediaBlob.type || (isVideo ? "video/mp4" : "image/jpeg")
        const uploadHeaders: any = {
          "Content-Type": contentType
        };
        if (!isVideo) {
          uploadHeaders["Authorization"] = `Bearer ${token}`;
        }

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: uploadHeaders,
          body: mediaBlob
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`LinkedIn Binary Upload Error (${uploadRes.status}): ${errText}`);
        }

        // Setup the UGC post body with media
        body = {
          author: author,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: post.content || ""
              },
              shareMediaCategory: isVideo ? "VIDEO" : "IMAGE",
              media: [
                {
                  status: "READY",
                  media: assetUrn
                }
              ]
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
          }
        }
      } else {
        body = {
          author: author,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: post.content || ""
              },
              shareMediaCategory: "NONE"
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
          }
        }
      }

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0"
        },
        body: JSON.stringify(body),
      })

      if (response.status === 401 && refreshToken) {
        return { retry: true }
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(`LinkedIn API Error: ${err.message || response.statusText}`)
      }

      return await response.json()
    }

    let result = await attemptPublish(accessToken!)

    if (result.retry && refreshToken) {
      accessToken = await refreshLinkedInToken(userId, post.workspaceId, refreshToken)
      result = await attemptPublish(accessToken!)
    }

    return {
      success: true,
      platformId: result.id,
    }
  } catch (error: any) {
    console.error("Error publishing to LinkedIn:", error)
    return { success: false, error: error.message }
  }
}

async function publishToFacebook(userId: string, post: any) {
  try {
    const facebook = await getSocialData(userId, post.workspaceId, "facebook")
    if (!facebook || !facebook.accessToken) throw new Error("Facebook account not connected")

    const accessToken = facebook.accessToken
    const pageId = facebook.id

    // Determine endpoint based on media type
    let endpoint = `https://graph.facebook.com/v${config.facebook.apiVersion}/${pageId}/feed`
    const body: any = {
      message: post.content,
      access_token: accessToken,
    }

    if (post.mediaUrl) {
      const isVideo = post.contentType === "video" || post.mediaUrl.match(/\.(mp4|mov|webm)$/i)
      if (isVideo) {
        endpoint = `https://graph.facebook.com/v${config.facebook.apiVersion}/${pageId}/videos`
        body.file_url = post.mediaUrl
        body.description = post.content
      } else {
        endpoint = `https://graph.facebook.com/v${config.facebook.apiVersion}/${pageId}/photos`
        body.url = post.mediaUrl
        body.caption = post.content
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || "Facebook publishing failed")
    }

    return {
      success: true,
      platformId: result.id || result.post_id,
    }
  } catch (error: any) {
    console.error("Error publishing to Facebook:", error)
    return { success: false, error: error.message }
  }
}

async function publishToBluesky(userId: string, post: any) {
  try {
    const bluesky = await getSocialData(userId, post.workspaceId, "bluesky")
    if (!bluesky || !bluesky.accessToken) {
      throw new Error("Bluesky account not connected")
    }

    // Bluesky uses the identifier (handle) and accessToken (app password)
    const identifier = bluesky.identifier || bluesky.username
    if (!identifier) throw new Error("Bluesky identifier not found. Please reconnect your account.")

    const { postToBluesky } = await import("./bluesky-service")

    // Bluesky has a 300 character limit
    let content = post.content || ""
    if (content.length > 300) {
      content = content.substring(0, 297) + "..."
    }

    const result = await postToBluesky(
      identifier,
      bluesky.accessToken, // We store app password here
      content,
      post.mediaUrl
    )

    if (!result.success) {
      throw new Error(result.error || "Bluesky publishing failed")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error publishing to Bluesky:", error)
    return { success: false, error: error.message }
  }
}

async function publishToPinterest(userId: string, post: any, preFetchedBlob: Blob | null = null) {
  try {
    const pinterest = await getSocialData(userId, post.workspaceId, "pinterest")
    if (!pinterest || !pinterest.accessToken) throw new Error("Pinterest account not connected")

    if (!post.mediaUrl) {
      return { success: false, error: "Pinterest requires an image or video." }
    }

    const accessToken = pinterest.accessToken
    const isVideo = post.contentType === "video" || post.mediaUrl?.match(/\.(mp4|mov|webm)$/i)

    // Pinterest Pins API v5 standard access only supports image_url
    // Video pins require a multi-step upload process (POST /media)
    // For now, we publish videos as image pins using the thumbnail or the video URL as a static preview
    const pinBody: any = {
      title: post.title || post.content?.substring(0, 100) || "Scheduled Pin",
      description: post.content || "",
      link: post.link || null,
      media_source: {
        source_type: "image_url",
        url: isVideo ? (post.thumbnailUrl || post.mediaUrl) : post.mediaUrl,
      },
    }

    // Use a board if the account has one stored, otherwise use the first accessible board
    if (pinterest.boardId) {
      pinBody.board_id = pinterest.boardId
    } else {
      // Fetch first board
      const boardsRes = await fetch("https://api.pinterest.com/v5/boards?page_size=1", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (boardsRes.ok) {
        const boardsData = await boardsRes.json()
        if (boardsData.items?.length > 0) {
          pinBody.board_id = boardsData.items[0].id
        }
      }
    }

    if (!pinBody.board_id) {
      return { success: false, error: "No Pinterest board found. Please create a board on Pinterest first." }
    }

    const response = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinBody),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || result.error || "Pinterest publishing failed")
    }

    return { success: true, platformId: result.id }
  } catch (error: any) {
    console.error("Error publishing to Pinterest:", error)
    return { success: false, error: error.message }
  }
}