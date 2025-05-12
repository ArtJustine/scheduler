export interface PostType {
  id: string
  userId: string
  title: string
  description: string
  platform: string
  contentType: string
  scheduledFor: string
  mediaUrl: string | null
  status: "scheduled" | "published" | "failed"
  createdAt: string
}
