// lib/blog-service.ts
// Blog service for managing blog posts in Firebase
import { serverDb } from "./firebase-server"
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore"
import type { BlogPost, BlogCategory, CreateBlogPostInput } from "@/types/blog"

// Helper to generate URL-friendly slug
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

// Create a new blog post
export async function createBlogPost(input: CreateBlogPostInput, authorId: string, authorName: string, authorEmail: string): Promise<string> {
    if (!serverDb) throw new Error("Database not initialized")

    const slug = input.slug || generateSlug(input.title)
    const excerpt = input.excerpt || input.content.substring(0, 160)

    const blogPost = {
        title: input.title,
        slug,
        metaDescription: input.metaDescription,
        content: input.content,
        excerpt,
        featuredImage: input.featuredImage || null,
        categories: input.categories || [],
        tags: input.tags || [],
        videoUrl: input.videoUrl || null,
        author: {
            id: authorId,
            name: authorName,
            email: authorEmail,
        },
        status: input.status,
        publishedAt: input.publishedAt ? Timestamp.fromDate(new Date(input.publishedAt)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        views: 0,
        seo: {
            keywords: input.seo?.keywords || [],
            ogImage: input.seo?.ogImage || input.featuredImage || null,
            ogTitle: input.seo?.ogTitle || input.title,
            ogDescription: input.seo?.ogDescription || input.metaDescription,
            canonicalUrl: input.seo?.canonicalUrl || null,
        },
    }

    const docRef = await addDoc(collection(serverDb, "blog_posts"), blogPost)
    return docRef.id
}

// Update an existing blog post
export async function updateBlogPost(postId: string, input: Partial<CreateBlogPostInput>): Promise<void> {
    if (!serverDb) throw new Error("Database not initialized")

    const updates: any = {
        updatedAt: Timestamp.now(),
    }

    if (input.title) updates.title = input.title
    if (input.slug) updates.slug = input.slug
    if (input.metaDescription) updates.metaDescription = input.metaDescription
    if (input.content) updates.content = input.content
    if (input.excerpt) updates.excerpt = input.excerpt
    if (input.featuredImage !== undefined) updates.featuredImage = input.featuredImage
    if (input.categories) updates.categories = input.categories
    if (input.tags) updates.tags = input.tags
    if (input.videoUrl !== undefined) updates.videoUrl = input.videoUrl
    if (input.status) updates.status = input.status
    if (input.publishedAt) updates.publishedAt = Timestamp.fromDate(new Date(input.publishedAt))
    if (input.seo) {
        updates.seo = {
            keywords: input.seo.keywords || [],
            ogImage: input.seo.ogImage,
            ogTitle: input.seo.ogTitle,
            ogDescription: input.seo.ogDescription,
            canonicalUrl: input.seo.canonicalUrl,
        }
    }

    await updateDoc(doc(serverDb, "blog_posts", postId), updates)
}

// Delete a blog post
export async function deleteBlogPost(postId: string): Promise<void> {
    if (!serverDb) throw new Error("Database not initialized")
    await deleteDoc(doc(serverDb, "blog_posts", postId))
}

// Get a single blog post by ID
export async function getBlogPostById(postId: string): Promise<BlogPost | null> {
    if (!serverDb) throw new Error("Database not initialized")

    const docSnap = await getDoc(doc(serverDb, "blog_posts", postId))
    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as BlogPost
}

// Get a blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!serverDb) throw new Error("Database not initialized")

    const cleanSlug = slug.trim()
    const q = query(collection(serverDb, "blog_posts"), where("slug", "==", cleanSlug), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) return null

    const docSnap = querySnapshot.docs[0]
    const data = docSnap.data()
    return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as BlogPost
}

// Get all published blog posts
export async function getPublishedBlogPosts(limitCount: number = 20): Promise<BlogPost[]> {
    if (!serverDb) throw new Error("Database not initialized")

    const q = query(
        collection(serverDb, "blog_posts"),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc"),
        limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            ...data,
            publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as BlogPost
    })
}

// Get all blog posts (admin)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
    if (!serverDb) throw new Error("Database not initialized")

    const q = query(collection(serverDb, "blog_posts"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            ...data,
            publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as BlogPost
    })
}

// Increment blog post views
export async function incrementBlogPostViews(postId: string): Promise<void> {
    if (!serverDb) throw new Error("Database not initialized")

    const postRef = doc(serverDb, "blog_posts", postId)
    const postSnap = await getDoc(postRef)

    if (postSnap.exists()) {
        const currentViews = postSnap.data().views || 0
        await updateDoc(postRef, { views: currentViews + 1 })
    }
}

// Category management
export async function createCategory(name: string, description: string): Promise<string> {
    if (!serverDb) throw new Error("Database not initialized")

    const slug = generateSlug(name)
    const category = {
        name,
        slug,
        description,
        count: 0,
        createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(serverDb, "blog_categories"), category)
    return docRef.id
}

export async function getAllCategories(): Promise<BlogCategory[]> {
    if (!serverDb) throw new Error("Database not initialized")

    const querySnapshot = await getDocs(collection(serverDb, "blog_categories"))
    return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
        } as BlogCategory
    })
}
