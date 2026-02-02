// Blog post type definitions
export interface BlogPost {
    id: string
    title: string
    slug: string
    metaDescription: string
    content: string
    excerpt: string
    featuredImage?: string
    categories: string[]
    tags: string[]
    videoUrl?: string
    author: {
        id: string
        name: string
        email: string
    }
    status: 'draft' | 'published' | 'scheduled'
    publishedAt?: Date
    createdAt: Date
    updatedAt: Date
    views: number
    seo: {
        keywords: string[]
        ogImage?: string
        ogTitle?: string
        ogDescription?: string
        canonicalUrl?: string
    }
}

export interface BlogCategory {
    id: string
    name: string
    slug: string
    description: string
    count: number
    createdAt: Date
}

export interface CreateBlogPostInput {
    title: string
    slug?: string
    metaDescription: string
    content: string
    excerpt?: string
    featuredImage?: string
    categories: string[]
    tags: string[]
    videoUrl?: string
    status: 'draft' | 'published' | 'scheduled'
    publishedAt?: Date
    seo?: {
        keywords?: string[]
        ogImage?: string
        ogTitle?: string
        ogDescription?: string
        canonicalUrl?: string
    }
}
