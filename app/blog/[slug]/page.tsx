"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Head from "next/head"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, ArrowLeft, Share2 } from "lucide-react"
import type { BlogPost } from "@/types/blog"
import { Button } from "@/components/ui/button"

export default function BlogPostPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [post, setPost] = useState<BlogPost | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (slug) {
            fetchPost()
        }
    }, [slug])

    const fetchPost = async () => {
        try {
            const response = await fetch(`/api/blog/posts/${slug}`)
            if (response.ok) {
                const data = await response.json()
                setPost(data.post)
                // Increment views
                fetch(`/api/blog/posts/${slug}/view`, { method: "POST" })
            } else {
                router.push("/blog")
            }
        } catch (error) {
            console.error("Error fetching post:", error)
            router.push("/blog")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!post) return null

    // Format content (basic Markdown to HTML)
    const formatContent = (content: string) => {
        // Convert markdown-style formatting to HTML
        let formatted = content
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-5">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-6">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p class="mb-4">')
            // Code blocks
            .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')

        return `<p class="mb-4">${formatted}</p>`
    }

    return (
        <>
            <Head>
                {/* SEO Meta Tags */}
                <title>{post.seo.ogTitle || post.title}</title>
                <meta name="description" content={post.metaDescription} />
                <meta name="keywords" content={post.seo.keywords.join(", ")} />
                {post.seo.canonicalUrl && <link rel="canonical" href={post.seo.canonicalUrl} />}

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={post.seo.ogTitle || post.title} />
                <meta property="og:description" content={post.seo.ogDescription || post.metaDescription} />
                {post.seo.ogImage && <meta property="og:image" content={post.seo.ogImage} />}
                <meta property="article:published_time" content={post.publishedAt?.toISOString() || ""} />
                <meta property="article:author" content={post.author.name} />
                {post.tags.map((tag, idx) => (
                    <meta key={idx} property="article:tag" content={tag} />
                ))}

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.seo.ogTitle || post.title} />
                <meta name="twitter:description" content={post.seo.ogDescription || post.metaDescription} />
                {post.seo.ogImage && <meta name="twitter:image" content={post.seo.ogImage} />}

                {/* Structured Data (JSON-LD) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            headline: post.title,
                            description: post.metaDescription,
                            image: post.featuredImage,
                            author: {
                                "@type": "Person",
                                name: post.author.name,
                            },
                            datePublished: post.publishedAt,
                            dateModified: post.updatedAt,
                            publisher: {
                                "@type": "Organization",
                                name: "Chiyu",
                                logo: {
                                    "@type": "ImageObject",
                                    url: "/logo.png",
                                },
                            },
                        }),
                    }}
                />
            </Head>

            <div className="flex flex-col min-h-screen bg-background">
                <SiteHeader />

                <article className="flex-1 pt-32 pb-20">
                    <div className="container px-6 max-w-4xl mx-auto">
                        {/* Back Button */}
                        <Link href="/blog">
                            <Button variant="ghost" className="mb-8">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Blog
                            </Button>
                        </Link>

                        {/* Post Header */}
                        <header className="mb-12">
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {post.categories.map((category, idx) => (
                                    <Badge key={idx} variant="secondary">
                                        {category}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                        <span className="text-sm font-semibold text-primary">
                                            {post.author.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-foreground">{post.author.name}</div>
                                    </div>
                                </div>

                                {post.publishedAt && (
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                )}

                                <span className="flex items-center">
                                    <Eye className="h-4 w-4 mr-2" />
                                    {post.views.toLocaleString()} views
                                </span>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {post.featuredImage && (
                            <div className="mb-12 rounded-2xl overflow-hidden">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-auto"
                                />
                            </div>
                        )}

                        {/* Post Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none mb-12"
                            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                        />

                        {/* Video */}
                        {post.videoUrl && (
                            <div className="mb-12">
                                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                                    {post.videoUrl.includes("youtube.com") || post.videoUrl.includes("youtu.be") ? (
                                        <iframe
                                            src={post.videoUrl.replace("watch?v=", "embed/")}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video src={post.videoUrl} controls className="w-full h-full" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="mb-12 flex flex-wrap gap-2">
                                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                                {post.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Share */}
                        <div className="border-t pt-8">
                            <Button variant="outline">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share this post
                            </Button>
                        </div>
                    </div>
                </article>

                <SiteFooter />
            </div>
        </>
    )
}
