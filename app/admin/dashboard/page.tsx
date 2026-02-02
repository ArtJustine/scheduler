"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, FolderOpen, Eye, Edit, Trash2, LogOut } from "lucide-react"

export default function AdminDashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin")
        }

        if (user) {
            fetchStats()
        }
    }, [user, loading, router])

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/blog/posts?admin=true")
            if (response.ok) {
                const data = await response.json()
                const posts = data.posts || []
                setStats({
                    totalPosts: posts.length,
                    publishedPosts: posts.filter((p: any) => p.status === "published").length,
                    draftPosts: posts.filter((p: any) => p.status === "draft").length,
                    totalViews: posts.reduce((acc: number, p: any) => acc + (p.views || 0), 0),
                })
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">CMS Admin</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 px-6">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Manage your blog content</p>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Link href="/admin/posts/new">
                        <Card className="hover:border-primary transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Post</CardTitle>
                                <PlusCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">Create a new blog post</div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPosts}</div>
                            <p className="text-xs text-muted-foreground">All blog posts</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
                            <p className="text-xs text-muted-foreground">Live on site</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Posts</CardTitle>
                            <CardDescription>Manage all your blog content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/admin/posts">
                                <Button className="w-full justify-start" variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    All Posts
                                </Button>
                            </Link>
                            <Link href="/admin/posts/new">
                                <Button className="w-full justify-start" variant="outline">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create New Post
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>Organize your content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/admin/categories">
                                <Button className="w-full justify-start" variant="outline">
                                    <FolderOpen className="mr-2 h-4 w-4" />
                                    Manage Categories
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
