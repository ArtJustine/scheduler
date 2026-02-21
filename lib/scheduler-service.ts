
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
        case "threads":
          publishResult = await publishToThreads(userId, post)
          break
        case "linkedin":
          publishResult = await publishToLinkedIn(userId, post)
          break
        case "facebook":
          publishResult = await publishToFacebook(userId, post)
          break
        case "pinterest":
          publishResult = await publishToPinterest(userId, post)
          break
        case "bluesky":
          publishResult = await publishToBluesky(userId, post)
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

    const successCount = Object.values(results).filter((r: any) => r.success).length

    // Update the post with individual platform status and overall status
    if (allSuccessful) {
      await postRef.update({
        status: "published",
        publishedAt: new Date().toISOString(),
        platformResults: results,
        error: null
      })
      console.log(`Successfully published post ${postId} to all platforms`)
    } else if (successCount > 0) {
      // Partial success - some platforms succeeded, some failed
      const failedPlatforms = Object.entries(results)
        .filter(([, r]: [string, any]) => !r.success)
        .map(([platform, r]: [string, any]) => `${platform}: ${r.error}`)
        .join("; ")
      await postRef.update({
        status: "partial",
        publishedAt: new Date().toISOString(),
        platformResults: results,
        error: `Partial publish. Failed platforms — ${failedPlatforms}`
      })
      console.warn(`Partially published post ${postId}. Failures: ${failedPlatforms}`)
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

    // Instagram requires media - cannot post text-only
    if (!post.mediaUrl) {
      return { success: false, error: "Instagram requires an image or video. Text-only posts are not supported." }
    }

    const igUserId = instagram.id || instagram.username
    const accessToken = instagram.accessToken

    // 1. Create Media Container
    const containerUrl = `https://graph.facebook.com/v18.0/${igUserId}/media`
    const containerParams: any = {
      caption: post.content || post.description || "",
      access_token: accessToken,
    }

    const isVideo = post.contentType === "video" || post.mediaUrl?.match(/\.(mp4|mov|avi|wmv|flv)$/i)
    if (isVideo) {
      containerParams.video_url = post.mediaUrl
      containerParams.media_type = "VIDEO"
    } else {
      containerParams.image_url = post.mediaUrl
      containerParams.media_type = "IMAGE"
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
async function publishToTikTok(userId: string, post: any) {
  let accessToken: string | null = null
  let refreshToken: string | null = null

  try {
    const tiktok = await getSocialData(userId, post.workspaceId, "tiktok")
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
          privacy_level: "SELF_ONLY", // Reverting to standard sandbox requirement
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
async function publishToLinkedIn(userId: string, post: any) {
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

      // If there's media, we should ideally upload it first
      // For now, let's implement text-only or basic share with image URL if possible
      // Actually, LinkedIn requires uploading images to their servers first.

      let body: any = {
        author: author,
        lifecycleState: "PUBLISHED",
        visibility: "PUBLIC",
      }

      const hasMedia = !!post.mediaUrl
      const isVideo = post.mediaUrl?.match(/\.(mp4|mov|avi|wmv|flv)$/i) || post.contentType === "video"

      if (hasMedia) {
        // LinkedIn media upload is complex, so we'll start with a simpler version
        // or a descriptive error if we can't handle it yet.
        // For a high-end app, we should implement the upload.

        // Let's try to use the 'specificContent' / 'com.linkedin.ugc.ShareContent' 
        // older but more common version if the newer 'rest/posts' is too strict

        const ugcUrl = "https://api.linkedin.com/v2/ugcPosts"
        const ugcBody = {
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
                  description: {
                    text: post.content?.substring(0, 200) || "Shared via Scheduler"
                  },
                  // Note: This requires a media URN from LinkedIn's upload API
                  // For now, we'll try to push text-only if media upload isn't ready
                  // but we'll include the media logic placeholder
                }
              ]
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
          }
        }

        // If we don't have a media URN, we have to fall back to text-only or error
        // Let's implement text-only first to ensure the connection works
        const textOnlyBody = {
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

        // TODO: Implement LinkedIn media upload
        // For now, sending text only since media URN is required for LinkedIn media
        body = textOnlyBody
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
      content
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

async function publishToPinterest(userId: string, post: any) {
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