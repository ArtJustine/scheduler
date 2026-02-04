"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Eye, ArrowRight, Search, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { BlogPost, BlogCategory } from "@/types/blog"

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [categories, setCategories] = useState<BlogCategory[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { collection, query, where, getDocs } = await import("firebase/firestore")

            if (firebaseDb) {
                // Fetch categories
                const catSnap = await getDocs(collection(firebaseDb, "blog_categories"))
                const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogCategory[]
                setCategories(cats)

                // Fetch published posts - simplify query to avoid index requirement if possible
                const q = query(
                    collection(firebaseDb, "blog_posts"),
                    where("status", "==", "published")
                )
                const querySnapshot = await getDocs(q)
                const fetchedPosts = querySnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        ...data,
                        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
                        createdAt: data.createdAt?.toDate?.() || data.createdAt,
                        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    }
                }) as BlogPost[]

                // Sort in memory to be safe
                fetchedPosts.sort((a, b) => {
                    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
                    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
                    return dateB - dateA
                })

                setPosts(fetchedPosts)
            }
        } catch (error) {
            console.error("Error fetching blog data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === "all" || post.categories.includes(selectedCategory)
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <SiteHeader />

            <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

                <div className="container px-6">
                    {/* Hero Section */}
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="relative flex h-2 w-2 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            THE CHIYU JOURNAL
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-slate-900 dark:text-white leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Insights for the <br />
                            <span className="text-primary italic">Vertical Era.</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Master your distribution with expert guides, platform updates, and strategy breakdowns from the creators of Chiyu.
                        </p>

                        {/* Search and Filters */}
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-2xl p-2">
                                    <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search the archive..."
                                        className="border-none focus-visible:ring-0 text-lg bg-transparent py-6"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-8">
                            <div className="flex items-center space-x-3 text-slate-900 dark:text-white">
                                <Tag className="h-5 w-5 text-primary" />
                                <span className="text-sm font-bold uppercase tracking-widest">Explore Categories</span>
                            </div>
                            <Tabs
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                                className="w-full md:w-auto"
                            >
                                <TabsList className="bg-muted/50 h-auto p-1.5 flex flex-wrap justify-start gap-1 rounded-2xl border border-border/50 backdrop-blur-sm">
                                    <TabsTrigger
                                        value="all"
                                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-sm"
                                    >
                                        All Chapters
                                    </TabsTrigger>
                                    {categories.map((category) => (
                                        <TabsTrigger
                                            key={category.id}
                                            value={category.name}
                                            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-sm"
                                        >
                                            {category.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-20 border rounded-3xl bg-muted/20">
                                <p className="text-xl text-muted-foreground">No articles found matching your criteria.</p>
                                <button
                                    onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                                    className="mt-4 text-primary font-semibold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <Card className="h-full border-none bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden group rounded-3xl">
                                            {post.featuredImage && (
                                                <div className="aspect-[16/10] overflow-hidden">
                                                    <img
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                            <CardContent className="p-8">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {post.categories.map((category: string, idx: number) => (
                                                        <span key={idx} className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                                            {category}
                                                        </span>
                                                    ))}
                                                </div>

                                                <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                    {post.title}
                                                </h2>

                                                <p className="text-muted-foreground mb-6 line-clamp-3 text-sm leading-relaxed">
                                                    {post.excerpt}
                                                </p>

                                                <div className="pt-6 border-t border-muted-foreground/10 flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center space-x-4">
                                                        {post.publishedAt && (
                                                            <span className="flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1.5" />
                                                                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center">
                                                            <Eye className="h-3 w-3 mr-1.5" />
                                                            {post.views}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center font-bold text-primary group-hover:translate-x-1 transition-transform">
                                                        Read More <ArrowRight className="h-3 w-3 ml-1" />
                                                    </div>
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
