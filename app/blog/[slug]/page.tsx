import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogPostBySlug } from "@/lib/blog-service"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BlogPostContent } from "@/components/blog/blog-post-content"

interface BlogPostPageProps {
    params: {
        slug: string
    }
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await getBlogPostBySlug(params.slug)

    if (!post) {
        return {
            title: "Post Not Found",
        }
    }

    return {
        title: post.seo.ogTitle || post.title,
        description: post.metaDescription,
        keywords: post.seo.keywords,
        openGraph: {
            title: post.seo.ogTitle || post.title,
            description: post.seo.ogDescription || post.metaDescription,
            images: post.seo.ogImage ? [{ url: post.seo.ogImage }] : post.featuredImage ? [{ url: post.featuredImage }] : [],
            type: "article",
            publishedTime: post.publishedAt?.toISOString(),
            authors: [post.author.name],
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: post.seo.ogTitle || post.title,
            description: post.seo.ogDescription || post.metaDescription,
            images: post.seo.ogImage ? [post.seo.ogImage] : post.featuredImage ? [post.featuredImage] : [],
        },
        alternates: {
            canonical: post.seo.canonicalUrl || undefined,
        },
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await getBlogPostBySlug(params.slug)

    if (!post || post.status !== "published") {
        notFound()
    }

    // JSON-LD Structured Data
    const jsonLd = {
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
                url: "https://chiyu.io/logo.png", // Use full URL if possible
            },
        },
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SiteHeader />
            <main className="flex-1">
                <BlogPostContent post={post} />
            </main>
            <SiteFooter />
        </div>
    )
}
