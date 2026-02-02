import { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, ArrowRight } from "lucide-react"
import { getPublishedBlogPosts } from "@/lib/blog-service"
import type { BlogPost } from "@/types/blog"

export const metadata: Metadata = {
    title: "Blog | Chiyu Social Media Scheduler",
    description: "Insights, tutorials, and updates about social media management and automation with Chiyu.",
}

export default async function BlogPage() {
    let posts: BlogPost[] = []
    try {
        posts = await getPublishedBlogPosts(50)
    } catch (error) {
        console.error("Error fetching blog posts:", error)
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <SiteHeader />

            <main className="flex-1 pt-32 pb-20">
                <div className="container px-6">
                    {/* Hero Section */}
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600">
                            Blog
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Insights, tutorials, and updates about social media management
                        </p>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="max-w-6xl mx-auto">
                        {posts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-lg text-muted-foreground">No blog posts yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {posts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
                                            {post.featuredImage && (
                                                <div className="aspect-video overflow-hidden bg-muted">
                                                    <img
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <CardContent className="p-6">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    {post.categories.slice(0, 2).map((category: string, idx: number) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {category}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>

                                                <p className="text-muted-foreground mb-4 line-clamp-3">
                                                    {post.excerpt}
                                                </p>

                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <div className="flex items-center space-x-4">
                                                        {post.publishedAt && (
                                                            <span className="flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {new Date(post.publishedAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            {post.views}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
