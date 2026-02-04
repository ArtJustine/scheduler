"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BlogPostContent } from "@/components/blog/blog-post-content"
import type { BlogPost } from "@/types/blog"
import { Loader2 } from "lucide-react"

export default function BlogPostPage() {
    const params = useParams()
    const slug = params.slug as string
    const [post, setPost] = useState<BlogPost | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (slug) {
            fetchPost()
        }
    }, [slug])

    const fetchPost = async () => {
        try {
            setIsLoading(true)
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { collection, query, where, getDocs, limit } = await import("firebase/firestore")

            if (firebaseDb) {
                const q = query(
                    collection(firebaseDb, "blog_posts"),
                    where("slug", "==", slug.toLowerCase()),
                    limit(1)
                )
                const querySnapshot = await getDocs(q)

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0]
                    const data = docSnap.data()
                    setPost({
                        id: docSnap.id,
                        ...data,
                        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
                        createdAt: data.createdAt?.toDate?.() || data.createdAt,
                        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    } as BlogPost)
                } else {
                    // Try without lowercase just in case
                    const q2 = query(
                        collection(firebaseDb, "blog_posts"),
                        where("slug", "==", slug),
                        limit(1)
                    )
                    const snap2 = await getDocs(q2)
                    if (!snap2.empty) {
                        const docSnap = snap2.docs[0]
                        const data = docSnap.data()
                        setPost({
                            id: docSnap.id,
                            ...data,
                            publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
                            createdAt: data.createdAt?.toDate?.() || data.createdAt,
                            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                        } as BlogPost)
                    } else {
                        setError(true)
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching post:", err)
            setError(true)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
                <SiteFooter />
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-center py-40">
                <SiteHeader />
                <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been moved.</p>
                <a href="/blog" className="text-primary hover:underline font-bold">Back to Blog</a>
                <SiteFooter />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <SiteHeader />
            <main className="flex-1">
                <BlogPostContent post={post} />
            </main>
            <SiteFooter />
        </div>
    )
}
