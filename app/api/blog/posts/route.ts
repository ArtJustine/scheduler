// API route for blog posts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createBlogPost, getAllBlogPosts, getPublishedBlogPosts } from "@/lib/blog-service"
import type { CreateBlogPostInput } from "@/types/blog"

// GET - Get all blog posts (admin) or published posts (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const isAdmin = searchParams.get("admin") === "true"

        const posts = isAdmin ? await getAllBlogPosts() : await getPublishedBlogPosts()

        return NextResponse.json({ posts }, { status: 200 })
    } catch (error: any) {
        console.error("Error fetching blog posts:", error)
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 }
        )
    }
}

// POST - Create a new blog post
export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated (you'll need to implement proper auth check)
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const input: CreateBlogPostInput = {
            title: body.title,
            slug: body.slug,
            metaDescription: body.metaDescription,
            content: body.content,
            excerpt: body.excerpt,
            featuredImage: body.featuredImage,
            categories: body.categories || [],
            tags: body.tags || [],
            videoUrl: body.videoUrl,
            status: body.status || "draft",
            publishedAt: body.status === "published" ? new Date() : undefined,
            seo: body.seo,
        }

        // Get user info (you should fetch this from your user database)
        const authorName = body.authorName || "Admin"
        const authorEmail = body.authorEmail || "admin@example.com"

        const postId = await createBlogPost(input, userId, authorName, authorEmail)

        return NextResponse.json(
            { success: true, postId },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Error creating blog post:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create blog post" },
            { status: 500 }
        )
    }
}
