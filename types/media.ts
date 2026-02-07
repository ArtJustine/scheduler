export interface MediaItem {
  id: string
  userId: string
  title: string
  type: "image" | "video"
  url: string
  fileName: string
  fileSize: number
  storagePath: string
  createdAt: string
  thumbnailUrl?: string
}
