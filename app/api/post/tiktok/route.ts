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

    if (!mediaUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the user's TikTok account information
    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User document not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    if (!userData.tiktok || !userData.tiktok.accessToken) {
      return NextResponse.json({ error: "TikTok account not connected" }, { status: 400 })
    }

    const accessToken = userData.tiktok.accessToken
    const openId = userData.tiktok.id

    // If scheduledFor is in the future, store the post in Firestore for later publishing
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      // Store the post in Firestore
      const postId = `tiktok_${Date.now()}`

      await updateDoc(userDocRef, {
        [`scheduledPosts.${postId}`]: {
          platform: "tiktok",
          caption,
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

    // Upload the video to TikTok
    const uploadResponse = await fetch(
      `https://open-api.tiktok.com/share/video/upload/?open_id=${openId}&access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: JSON.stringify({
          video: mediaUrl,
          description: caption || "",
        }),
      },
    )

    const uploadData = await uploadResponse.json()

    if (!uploadData.data || !uploadData.data.share_id) {
      return NextResponse.json({ error: "Failed to upload video to TikTok" }, { status: 500 })
    }

    // Store the published video in Firestore
    const postId = `tiktok_${uploadData.data.share_id}`

    await updateDoc(userDocRef, {
      [`publishedPosts.${postId}`]: {
        platform: "tiktok",
        caption,
        mediaUrl,
        publishedAt: new Date().toISOString(),
        status: "published",
        tiktokId: uploadData.data.share_id,
        createdAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Video published successfully",
      postId,
      tiktokId: uploadData.data.share_id,
    })
  } catch (error) {
    console.error("Error posting to TikTok:", error)

    return NextResponse.json({ error: "Failed to post to TikTok" }, { status: 500 })
  }
}
