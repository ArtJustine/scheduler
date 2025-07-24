import { NextResponse } from "next/server"
import { createPost } from "@/lib/firebase/posts"
import { firebaseAuth } from "@/lib/firebase-client"
import type { Auth as FirebaseAuth } from "firebase/auth"

const auth: FirebaseAuth | undefined = firebaseAuth

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { title, content, mediaUrl, scheduledFor } = body

    if (!title || !content || !mediaUrl || !scheduledFor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Authenticate user
    const user = auth?.currentUser
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create the post for YouTube
    const postData = {
      title,
      description: content, // Use content as description
      mediaUrl,
      scheduledFor,
      platform: "youtube",
      status: "scheduled" as const,
      contentType: "video",
      userId: user.uid,
    }

    const postId = await createPost(postData)

    return NextResponse.json({ success: true, postId }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating YouTube post:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
