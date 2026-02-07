export interface PostType {
  id: string
  userId: string
  title: string
  description: string
  platform: string
  contentType: string
  scheduledFor: string
  mediaUrl: string | null
  thumbnailUrl?: string | null
  status: "scheduled" | "published" | "failed"
  error?: string | null
  createdAt: string
  content?: string
  publishedAt?: string
  analytics?: {
    likes: number
    comments: number
    shares: number
    impressions: number
  }
  aspectRatio?: "9:16" | "16:9" | "community"
  youtubePostType?: "video" | "short" | "community"
  youtubeOptions?: {
    playlist?: string
    madeForKids?: boolean
    ageRestriction?: boolean
    alteredContent?: boolean
    tags?: string[]
    category?: string
  }
}
