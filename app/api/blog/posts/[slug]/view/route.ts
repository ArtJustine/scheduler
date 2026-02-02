// API route for incrementing blog post views
import { NextRequest, NextResponse } from "next/server"
import { getBlogPostBySlug, incrementBlogPostViews } from "@/lib/blog-service"

// POST - Increment view count
export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const post = await getBlogPostBySlug(params.slug)

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        await incrementBlogPostViews(post.id)

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        console.error("Error incrementing views:", error)
        return NextResponse.json(
            { error: "Failed to increment views" },
            { status: 500 }
        )
    }
}
