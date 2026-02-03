"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import type { BlogCategory, BlogPost } from "@/types/blog"

export default function EditPostPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const postId = params.id as string
    const [isSaving, setIsSaving] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [categories, setCategories] = useState<BlogCategory[]>([])

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        metaDescription: "",
        content: "",
        excerpt: "",
        featuredImage: "",
        videoUrl: "",
        categories: [] as string[],
        tags: "",
        status: "draft" as "draft" | "published" | "scheduled",
        seoKeywords: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        canonicalUrl: "",
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin")
            return
        }

        if (user && postId) {
            fetchPost()
            fetchCategories()
        }
    }, [user, loading, router, postId])

    const fetchPost = async () => {
        try {
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { doc, getDoc } = await import("firebase/firestore")

            if (firebaseDb) {
                const docRef = doc(firebaseDb, "blog_posts", postId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const post = docSnap.data() as BlogPost
                    setFormData({
                        title: post.title,
                        slug: post.slug,
                        metaDescription: post.metaDescription,
                        content: post.content,
                        excerpt: post.excerpt || "",
                        featuredImage: post.featuredImage || "",
                        videoUrl: post.videoUrl || "",
                        categories: post.categories || [],
                        tags: post.tags?.join(", ") || "",
                        status: post.status,
                        seoKeywords: post.seo?.keywords?.join(", ") || "",
                        ogTitle: post.seo?.ogTitle || "",
                        ogDescription: post.seo?.ogDescription || "",
                        ogImage: post.seo?.ogImage || "",
                        canonicalUrl: post.seo?.canonicalUrl || "",
                    })
                } else {
                    alert("Post not found")
                    router.push("/admin/posts")
                }
            }
        } catch (error) {
            console.error("Error fetching post:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { collection, getDocs } = await import("firebase/firestore")

            if (firebaseDb) {
                const querySnapshot = await getDocs(collection(firebaseDb, "blog_categories"))
                const cats = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as BlogCategory[]
                setCategories(cats)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const handleSubmit = async (e?: React.FormEvent, statusOverride?: "draft" | "published" | "scheduled") => {
        if (e) e.preventDefault()
        setIsSaving(true)

        try {
            const finalStatus = statusOverride || formData.status
            const { firebaseDb } = await import("@/lib/firebase-client")
            const { doc, updateDoc, Timestamp } = await import("firebase/firestore")

            if (!firebaseDb) throw new Error("Firestore not initialized")

            const blogPostUpdate: any = {
                title: formData.title,
                slug: formData.slug,
                metaDescription: formData.metaDescription,
                content: formData.content,
                excerpt: formData.excerpt,
                featuredImage: formData.featuredImage || null,
                categories: formData.categories || [],
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
                videoUrl: formData.videoUrl || null,
                status: finalStatus,
                updatedAt: Timestamp.now(),
                seo: {
                    keywords: formData.seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
                    ogImage: formData.ogImage || formData.featuredImage || null,
                    ogTitle: formData.ogTitle || formData.title,
                    ogDescription: formData.ogDescription || formData.metaDescription,
                    canonicalUrl: formData.canonicalUrl || null,
                },
            }

            if (finalStatus === "published" && formData.status !== "published") {
                blogPostUpdate.publishedAt = Timestamp.now()
            }

            await updateDoc(doc(firebaseDb, "blog_posts", postId), blogPostUpdate)
            router.push("/admin/posts")
        } catch (error: any) {
            console.error("Error updating post:", error)
            alert(`Failed to update post: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        setFormData({ ...formData, slug })
    }

    if (loading || isFetching) {
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
                        <Link href="/admin/posts">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Edit Post</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => handleSubmit(undefined, "draft")}
                            disabled={isSaving}
                        >
                            Save Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit(undefined, "published")}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Updating..." : "Update & Publish"}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container max-w-5xl py-8 px-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Main post details and content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter post title"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug">URL Slug</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="url-friendly-slug"
                                    />
                                    <Button type="button" variant="outline" onClick={generateSlug}>
                                        Generate
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Brief summary (optional)"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="content">Content *</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your blog post content here... (Supports Markdown)"
                                    rows={20}
                                    required
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tip: Use Markdown formatting for headings, links, lists, etc.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Media</CardTitle>
                            <CardDescription>Images and videos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="featuredImage">Featured Image URL</Label>
                                <Input
                                    id="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    type="url"
                                />
                            </div>

                            <div>
                                <Label htmlFor="videoUrl">Video URL (YouTube, Vimeo, etc.)</Label>
                                <Input
                                    id="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                    type="url"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO & Meta Data</CardTitle>
                            <CardDescription>Optimize for search engines</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="metaDescription">Meta Description *</Label>
                                <Textarea
                                    id="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    placeholder="Brief description for search engines (150-160 characters)"
                                    rows={2}
                                    required
                                    maxLength={160}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.metaDescription.length}/160 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
                                <Input
                                    id="seoKeywords"
                                    value={formData.seoKeywords}
                                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>

                            <div>
                                <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
                                <Input
                                    id="canonicalUrl"
                                    value={formData.canonicalUrl}
                                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                    placeholder="https://example.com/blog/post-url"
                                    type="url"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* OG Social Sharing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Sharing (Open Graph)</CardTitle>
                            <CardDescription>How your post appears on social media</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="ogTitle">OG Title</Label>
                                <Input
                                    id="ogTitle"
                                    value={formData.ogTitle}
                                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                                    placeholder="Leave empty to use post title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="ogDescription">OG Description</Label>
                                <Textarea
                                    id="ogDescription"
                                    value={formData.ogDescription}
                                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                                    placeholder="Leave empty to use meta description"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="ogImage">OG Image URL</Label>
                                <Input
                                    id="ogImage"
                                    value={formData.ogImage}
                                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                                    placeholder="Leave empty to use featured image"
                                    type="url"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories & Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories & Tags</CardTitle>
                            <CardDescription>Organize your content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Categories</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`cat-${cat.id}`}
                                                checked={formData.categories.includes(cat.name)}
                                                onChange={(e) => {
                                                    const newCats = e.target.checked
                                                        ? [...formData.categories, cat.name]
                                                        : formData.categories.filter(c => c !== cat.name)
                                                    setFormData({ ...formData, categories: newCats })
                                                }}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor={`cat-${cat.id}`} className="text-sm">
                                                {cat.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {categories.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No categories found. Use tags for now.</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publish Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Publish Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: "draft" | "published" | "scheduled") => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </main>
        </div>
    )
}
