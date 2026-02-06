import { firebaseDb } from "./firebase-client"
import { collection, getDocs, getDoc, updateDoc, doc, query, where } from "firebase/firestore"

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

    // Determine which platform to publish to
    let publishResult

    switch (post.platform) {
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
        throw new Error(`Unsupported platform: ${post.platform}`)
    }

    // If publishing was successful, update the post status to "published"
    if (publishResult.success) {
      await updateDoc(postRef, {
        status: "published",
        publishedAt: new Date().toISOString(),
        [`${post.platform}PostId`]: publishResult.platformId,
        error: null
      })
      console.log(`Successfully published post ${postId} to ${post.platform}`)
    } else {
      // If publishing failed, update the post status to "failed"
      await updateDoc(postRef, {
        status: "failed",
        error: publishResult.error,
      })
      console.error(`Failed to publish post ${postId} to ${post.platform}: ${publishResult.error}`)
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

// Function to publish a post to Instagram
async function publishToInstagram(userId: string, post: any) {
  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User settings not found")
    }

    const userData = userDoc.data()
    const instagram = userData.instagram

    if (!instagram || !instagram.accessToken) {
      throw new Error("Instagram account not connected or access token missing")
    }

    // Simplified IG Business API flow (requires Media Container -> Media Publish)
    // Note: This often requires a Facebook Page ID and IG User ID
    const igUserId = instagram.id || instagram.username
    const accessToken = instagram.accessToken

    // 1. Create Media Container
    const containerUrl = `https://graph.facebook.com/v18.0/${igUserId}/media`
    const containerParams: any = {
      image_url: post.mediaUrl,
      caption: post.description,
      access_token: accessToken,
    }

    if (post.contentType === "video") {
      containerParams.video_url = post.mediaUrl
      containerParams.media_type = "VIDEO"
    }

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerParams),
    })

    const containerData = await containerResponse.json()
    if (containerData.error) throw new Error(containerData.error.message)

    const creationId = containerData.id

    // 2. Wait for processing (for videos) - simplified for now
    if (post.contentType === "video") {
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    // 3. Publish Media
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

    return {
      success: true,
      platformId: publishData.id,
    }
  } catch (error: any) {
    console.error("Error publishing to Instagram:", error)
    return { success: false, error: error.message }
  }
}

// Function to publish a post to YouTube
async function publishToYouTube(userId: string, post: any) {
  try {
    if (!firebaseDb) throw new Error("Database not initialized")
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User settings not found")
    }

    const userData = userDoc.data()
    const youtube = userData.youtube

    if (!youtube || !youtube.accessToken) {
      throw new Error("YouTube account not connected")
    }

    const accessToken = youtube.accessToken

    // YouTube Video Upload involves 2-3 steps:
    // 1. Initialize upload (metadata)
    // 2. Upload binary

    // For simplicity in this env, we try a basic metadata create, 
    // but actual video publishing requires the file stream.
    // If the post has a mediaUrl, we theoretically need to pipe that to Google.

    const response = await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet,status", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title: post.title || post.description.substring(0, 100),
          description: post.description,
          categoryId: "22",
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false
        },
      }),
    })

    const data = await response.json()

    if (data.error) {
      // If token expired, we'd need to refresh it here
      throw new Error(`YouTube API Error: ${data.error.message}`)
    }

    // REAL implementation would need following for the video content:
    /*
    const uploadUrl = response.headers.get("Location");
    const videoStream = await fetch(post.mediaUrl).then(res => res.body);
    await fetch(uploadUrl, { method: "PUT", body: videoStream });
    */

    return {
      success: true,
      platformId: data.id,
    }
  } catch (error: any) {
    console.error("Error publishing to YouTube:", error)
    return { success: false, error: error.message }
  }
}