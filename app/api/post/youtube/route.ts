import { type NextRequest, NextResponse } from "next/server"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = firebaseAuth.currentUser

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { title, description, mediaUrl, scheduledFor } = body

    if (!title || !mediaUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the user's YouTube account information
    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User document not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    if (!userData.youtube || !userData.youtube.accessToken) {
      return NextResponse.json({ error: "YouTube account not connected" }, { status: 400 })
    }

    const accessToken = userData.youtube.accessToken

    // If scheduledFor is in the future, store the post in Firestore for later publishing
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      // Store the post in Firestore
      const postId = `youtube_${Date.now()}`

      await updateDoc(userDocRef, {
        [`scheduledPosts.${postId}`]: {
          platform: "youtube",
          title,
          description,
          mediaUrl,
          scheduledFor,
          status: "scheduled",
          createdAt: new Date().toISOString(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Video scheduled successfully",
        postId,
      })
    }

    // If scheduledFor is not provided or is in the past, publish the video immediately

    // First, create a video resource
    const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
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
      return NextResponse.json({ error: "Failed to create video on YouTube" }, { status: 500 })
    }

    // Store the published video in Firestore
    const postId = `youtube_${videoData.id}`

    await updateDoc(userDocRef, {
      [`publishedPosts.${postId}`]: {
        platform: "youtube",
        title,
        description,
        mediaUrl,
        publishedAt: new Date().toISOString(),
        status: "published",
        youtubeId: videoData.id,
        createdAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Video published successfully",
      postId,
      youtubeId: videoData.id,
    })
  } catch (error) {
    console.error("Error posting to YouTube:", error)

    return NextResponse.json({ error: "Failed to post to YouTube" }, { status: 500 })
  }
}
