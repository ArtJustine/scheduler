// API route for individual blog post by slug
import { NextRequest, NextResponse } from "next/server"
import { getBlogPostBySlug, incrementBlogPostViews } from "@/lib/blog-service"

// GET - Get blog post by slug
export async function GET(
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

        // Only return published posts to public
        if (post.status !== "published") {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ post }, { status: 200 })
    } catch (error: any) {
        console.error("Error fetching blog post:", error)
        return NextResponse.json(
            { error: "Failed to fetch blog post" },
            { status: 500 }
        )
    }
}
