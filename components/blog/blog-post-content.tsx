"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, ArrowLeft, Share2 } from "lucide-react"
import type { BlogPost } from "@/types/blog"

interface BlogPostContentProps {
    post: BlogPost
}

export function BlogPostContent({ post }: BlogPostContentProps) {
    useEffect(() => {
        // Increment views client-side
        fetch(`/api/blog/posts/${post.slug}/view`, { method: "POST" })
    }, [post.slug])

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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.metaDescription,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert("Link copied to clipboard!")
        }
    }

    return (
        <article className="flex-1 pt-32 pb-20 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

            <div className="container px-6 max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-12">
                    <Link href="/blog">
                        <Button variant="ghost" className="group text-muted-foreground hover:text-primary transition-colors pl-0 hover:bg-transparent">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Insights
                        </Button>
                    </Link>
                </div>

                {/* Post Header */}
                <header className="mb-16">
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        {post.categories.map((category, idx) => (
                            <Badge key={idx} variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-wider text-[10px] font-bold">
                                {category}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1] text-slate-900 dark:text-white">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 text-muted-foreground border-y border-border/50 py-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-base font-bold text-white">
                                    {post.author.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">{post.author.name}</div>
                                <div className="text-xs uppercase tracking-widest font-medium">Expert Contributor</div>
                            </div>
                        </div>

                        <div className="flex items-center bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                            {post.publishedAt && (
                                <span className="flex items-center text-sm font-medium">
                                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center text-sm font-medium ml-auto">
                            <Eye className="h-4 w-4 mr-2 text-primary" />
                            {post.views.toLocaleString()} reads
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {post.featuredImage && (
                    <div className="mb-16 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border border-white/10 group">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700"
                        />
                    </div>
                )}

                {/* Post Content */}
                <div
                    className="prose prose-lg md:prose-xl dark:prose-invert max-w-none mb-16 prose-p:leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 dark:prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                />

                {/* Video */}
                {post.videoUrl && (
                    <div className="mb-16">
                        <div className="aspect-video rounded-[2rem] overflow-hidden bg-muted border border-white/10 shadow-2xl">
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

                {/* Tags & Share */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-12 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="px-4 py-1.5 rounded-full border-border hover:bg-muted transition-colors text-sm font-medium">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    <Button
                        onClick={handleShare}
                        className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10 px-8 h-12"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Insight
                    </Button>
                </div>
            </div>
        </article>
    )
}
