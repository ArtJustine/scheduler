import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { firebaseDb } from "@/lib/firebase-client"
import { checkScheduledPosts } from "@/lib/scheduler-service"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params
        if (!firebaseDb) throw new Error("Database not initialized")

        // For simplicity, we trigger the scheduler which will pick up this post if it's due
        // OR we can explicitly call a publish function for this specific post
        // But since checkScheduledPosts uses the 'now' time, we might need to update the post first

        const postRef = doc(firebaseDb, "posts", postId)
        const postSnap = await getDoc(postRef)

        if (!postSnap.exists()) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        // Set scheduledFor to now if it's in the future and the user wants to publish now
        await updateDoc(postRef, {
            scheduledFor: new Date().toISOString(),
            status: "scheduled"
        })

        // Now call the scheduler to process it
        await checkScheduledPosts()

        // Refresh the status
        const updatedSnap = await getDoc(postRef)
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
