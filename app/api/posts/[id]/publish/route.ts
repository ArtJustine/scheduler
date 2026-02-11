
import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { checkScheduledPosts } from "@/lib/scheduler-service"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params
        if (!adminDb) throw new Error("Database not initialized")

        // Using Admin SDK syntax
        const postRef = adminDb.collection("posts").doc(postId)
        const postSnap = await postRef.get()

        if (!postSnap.exists) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        // Set scheduledFor to now if it's in the future and the user wants to publish now
        await postRef.update({
            scheduledFor: new Date().toISOString(),
            status: "scheduled"
        })

        // Now call the scheduler to process it
        await checkScheduledPosts()

        // Refresh the status
        const updatedSnap = await postRef.get()
        const updatedPost = updatedSnap.data()

        if (updatedPost?.status === "published") {
            return NextResponse.json({ success: true, message: "Post published successfully!" })
        } else if (updatedPost?.status === "failed") {
            return NextResponse.json({
                success: false,
                error: updatedPost.error || "Publishing failed. Check account connection."
            })
        } else {
            return NextResponse.json({
                success: true,
                message: "Publishing process started. It might take a minute."
            })
        }

    } catch (error: any) {
        console.error("Manual publish error:", error)
        return NextResponse.json({ error: error.message || "Failed to publish" }, { status: 500 })
    }
}
