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
    const { caption, mediaUrl, scheduledFor } = body

    if (!caption || !mediaUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the user's Instagram account information
    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User document not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    if (!userData.instagram || !userData.instagram.accessToken) {
      return NextResponse.json({ error: "Instagram account not connected" }, { status: 400 })
    }

    const accessToken = userData.instagram.accessToken

    // If scheduledFor is in the future, store the post in Firestore for later publishing
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      // Store the post in Firestore
      const postId = `instagram_${Date.now()}`

      await updateDoc(userDocRef, {
        [`scheduledPosts.${postId}`]: {
          platform: "instagram",
          caption,
          mediaUrl,
          scheduledFor,
          status: "scheduled",
          createdAt: new Date().toISOString(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Post scheduled successfully",
        postId,
      })
    }

    // If scheduledFor is not provided or is in the past, publish the post immediately

    // First, upload the media to Instagram
    const uploadResponse = await fetch(
      `https://graph.instagram.com/me/media?image_url=${encodeURIComponent(
        mediaUrl,
      )}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
    )

    const uploadData = await uploadResponse.json()

    if (!uploadData.id) {
      return NextResponse.json({ error: "Failed to upload media to Instagram" }, { status: 500 })
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
      return NextResponse.json({ error: "Failed to publish post to Instagram" }, { status: 500 })
    }

    // Store the published post in Firestore
    const postId = `instagram_${publishData.id}`

    await updateDoc(userDocRef, {
      [`publishedPosts.${postId}`]: {
        platform: "instagram",
        caption,
        mediaUrl,
        publishedAt: new Date().toISOString(),
        status: "published",
        instagramId: publishData.id,
        createdAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Post published successfully",
      postId,
      instagramId: publishData.id,
    })
  } catch (error) {
    console.error("Error posting to Instagram:", error)

    return NextResponse.json({ error: "Failed to post to Instagram" }, { status: 500 })
  }
}
