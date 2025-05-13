import { firebaseDb } from "./firebase-client"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"

// Function to check for scheduled posts that need to be published
export async function checkScheduledPosts() {
  try {
    // Get all users
    const usersCollection = collection(firebaseDb, "users")
    const usersSnapshot = await getDocs(usersCollection)

    const now = new Date()

    // Iterate through each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()

      // Check if the user has scheduled posts
      if (!userData.scheduledPosts) continue

      // Iterate through each scheduled post
      for (const [postId, post] of Object.entries(userData.scheduledPosts)) {
        // Check if the post is scheduled for now or in the past
        if (post.status === "scheduled" && new Date(post.scheduledFor) <= now) {
          // Publish the post
          await publishPost(userDoc.id, postId, post)
        }
      }
    }
  } catch (error) {
    console.error("Error checking scheduled posts:", error)
  }
}

// Function to publish a scheduled post
async function publishPost(userId: string, postId: string, post: any) {
  try {
    // Update the post status to "publishing"
    const userDocRef = doc(firebaseDb, "users", userId)
    await updateDoc(userDocRef, {
      [`scheduledPosts.${postId}.status`]: "publishing",
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
        publishResult = await publishToTikTok(userId, post)
        break
      default:
        throw new Error(`Unsupported platform: ${post.platform}`)
    }

    // If publishing was successful, update the post status to "published"
    if (publishResult.success) {
      // Move the post from scheduledPosts to publishedPosts
      await updateDoc(userDocRef, {
        [`scheduledPosts.${postId}`]: null,
        [`publishedPosts.${postId}`]: {
          ...post,
          status: "published",
          publishedAt: new Date().toISOString(),
          [`${post.platform}Id`]: publishResult.platformId,
        },
      })
    } else {
      // If publishing failed, update the post status to "failed"
      await updateDoc(userDocRef, {
        [`scheduledPosts.${postId}.status`]: "failed",
        [`scheduledPosts.${postId}.error`]: publishResult.error,
      })
    }
  } catch (error) {
    console.error(`Error publishing post ${postId}:`, error)

    // Update the post status to "failed"
    const userDocRef = doc(firebaseDb, "users", userId)
    await updateDoc(userDocRef, {
      [`scheduledPosts.${postId}.status`]: "failed",
      [`scheduledPosts.${postId}.error`]: error.message,
    })
  }
}

// Function to publish a post to Instagram
async function publishToInstagram(userId: string, post: any) {
  try {
    // Get the user's Instagram account information
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDocs(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const userData = userDoc.data()

    if (!userData.instagram || !userData.instagram.accessToken) {
      throw new Error("Instagram account not connected")
    }

    const accessToken = userData.instagram.accessToken

    // Upload the media to Instagram
    const uploadResponse = await fetch(
      `https://graph.instagram.com/me/media?image_url=${encodeURIComponent(
        post.mediaUrl,
      )}&caption=${encodeURIComponent(post.caption)}&access_token=${accessToken}`,
    )

    const uploadData = await uploadResponse.json()

    if (!uploadData.id) {
      throw new Error("Failed to upload media to Instagram")
    }

    // Publish the post
    const publishResponse = await fetch(
      `https://graph.instagram.com/me/media_publish?creation_id=${uploadData.id}&access_token=${accessToken}`,
      {
        method: "POST",
      },
    )

    const publishData = await publishResponse.json()

    if (!publishData.id) {
      throw new Error("Failed to publish post to Instagram")
    }

    return {
      success: true,
      platformId: publishData.id,
    }
  } catch (error) {
    console.error("Error publishing to Instagram:", error)

    return {
      success: false,
      error: error.message,
    }
  }
}

// Function to publish a post to YouTube
async function publishToYouTube(userId: string, post: any) {
  try {
    // Get the user's YouTube account information
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDocs(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const userData = userDoc.data()

    if (!userData.youtube || !userData.youtube.accessToken) {
      throw new Error("YouTube account not connected")
    }

    const accessToken = userData.youtube.accessToken

    // Create a video resource
    const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title: post.title,
          description: post.description,
          tags: [],
          categoryId: "22", // People & Blogs
        },
        status: {
          privacyStatus: "public",
        },
      }),
    })

    const videoData = await videoResponse.json()

    if (!videoData.id) {
      throw new Error("Failed to create video on YouTube")
    }

    return {
      success: true,
      platformId: videoData.id,
    }
  } catch (error) {
    console.error("Error publishing to YouTube:", error)

    return {
      success: false,
      error: error.message,
    }
  }
}

// Function to publish a post to TikTok
async function publishToTikTok(userId: string, post: any) {
  try {
    // Get the user's TikTok account information
    const userDocRef = doc(firebaseDb, "users", userId)
    const userDoc = await getDocs(userDocRef)

    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const userData = userDoc.data()

    if (!userData.tiktok || !userData.tiktok.accessToken) {
      throw new Error("TikTok account not connected")
    }

    const accessToken = userData.tiktok.accessToken
    const openId = userData.tiktok.id

    // Upload the video to TikTok
    const uploadResponse = await fetch(
      `https://open-api.tiktok.com/share/video/upload/?open_id=${openId}&access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: JSON.stringify({
          video: post.mediaUrl,
          description: post.caption || "",
        }),
      },
    )

    const uploadData = await uploadResponse.json()

    if (!uploadData.data || !uploadData.data.share_id) {
      throw new Error("Failed to upload video to TikTok")
    }

    return {
      success: true,
      platformId: uploadData.data.share_id,
    }
  } catch (error) {
    console.error("Error publishing to TikTok:", error)

    return {
      success: false,
      error: error.message,
    }
  }
}
