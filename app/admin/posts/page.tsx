"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, PlusCircle, Edit, Trash2, Eye, LogOut, ArrowLeft } from "lucide-react"
import type { BlogPost } from "@/types/blog"

export default function AdminPostsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin")
            return
        }

        if (user) {
            fetchPosts()
        }
    }, [user, loading, router])

    const fetchPosts = async () => {
        try {
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { collection, query, getDocs, orderBy } = await import("firebase/firestore")

            if (firebaseDb) {
                const q = query(collection(firebaseDb, "blog_posts"), orderBy("createdAt", "desc"))
                const querySnapshot = await getDocs(q)
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Handle dates correctly
                    publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
                    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
                    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
                })) as BlogPost[]
                setPosts(fetchedPosts)
            }
        } catch (error) {
            console.error("Error fetching posts:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return

        try {
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { doc, deleteDoc } = await import("firebase/firestore")

            if (firebaseDb) {
                await deleteDoc(doc(firebaseDb, "blog_posts", postId))
                setPosts(posts.filter(p => p.id !== postId))
            }
        } catch (error) {
            console.error("Error deleting post:", error)
        }
    }

    if (loading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <FileText className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">Blog Posts</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/posts/new">
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                New Post
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 px-6">
                {posts.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first blog post to get started</p>
                        <Link href="/admin/posts/new">
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create First Post
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={post.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-semibold">{post.title}</h3>
                                            <Badge variant={post.status === "published" ? "default" : "secondary"}>
                                                {post.status}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-3">{post.excerpt}</p>
                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                            <span>By {post.author.name}</span>
                                            {post.publishedAt && (
                                                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                            )}
                                            <span className="flex items-center">
                                                <Eye className="h-3 w-3 mr-1" />
                                                {post.views} views
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Link href={`/admin/posts/edit/${post.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
