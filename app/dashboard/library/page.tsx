"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MediaGrid } from "@/components/dashboard/media-grid"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { HashtagManager } from "@/components/dashboard/hashtag-manager"
import { CaptionLibrary } from "@/components/dashboard/caption-library"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-provider"
import {
  getMediaLibrary,
  deleteMedia,
  getHashtagGroups,
  getCaptionTemplates,
  createCaption,
  deleteCaption,
  createHashtag,
  deleteHashtag
} from "@/lib/data-service"
import type { MediaItem } from "@/types/media"
import type { HashtagGroup } from "@/types/hashtag"
import type { CaptionTemplate } from "@/types/caption"

export default function LibraryPage() {
  return (
    <Suspense fallback={<div>Loading library...</div>}>
      <LibraryContent />
    </Suspense>
  )
}

function LibraryContent() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([])
  const [captionTemplates, setCaptionTemplates] = useState<CaptionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "media"
  const [activeTab, setActiveTab] = useState(tabParam)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const loadLibraryData = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const userId = user.uid || (user as any).id
      console.log("Library: Loading data for user", userId)
      const [media, hashtags, captions] = await Promise.all([
        getMediaLibrary(userId),
        getHashtagGroups(userId),
        getCaptionTemplates(userId),
      ])
      setMediaItems(media || [])
      setHashtagGroups(hashtags || [])
      setCaptionTemplates(captions || [])
    } catch (error) {
      console.error("Library: Error loading library data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadLibraryData()
    }
  }, [user])

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteMedia(id)
      setMediaItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error deleting media:", error)
    }
  }

  const handleAddHashtag = async (group: any) => {
    try {
      await createHashtag(group.name, group.hashtags)
      loadLibraryData()
    } catch (error) {
      console.error("Error adding hashtag group:", error)
    }
  }

  const handleDeleteHashtag = async (id: string) => {
    try {
      await deleteHashtag(id)
      loadLibraryData()
    } catch (error) {
      console.error("Error deleting hashtag group:", error)
    }
  }

  const handleAddCaption = async (caption: any) => {
    try {
      await createCaption(caption.title, caption.content)
      loadLibraryData()
    } catch (error) {
      console.error("Error adding caption:", error)
    }
  }

  const handleDeleteCaption = async (id: string) => {
    try {
      await deleteCaption(id)
      loadLibraryData()
    } catch (error) {
      console.error("Error deleting caption:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
        <p className="text-muted-foreground">Manage your media, hashtags, and description templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="media" className="px-6">Media</TabsTrigger>
          <TabsTrigger value="hashtags" className="px-6">Hashtags</TabsTrigger>
          <TabsTrigger value="descriptions" className="px-6">Descriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="mt-0 outline-none">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl">Media Library</CardTitle>
                <CardDescription>Manage your images and videos</CardDescription>
              </div>
              <Button size="sm" className="shadow-sm" onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : mediaItems.length > 0 ? (
                <MediaGrid items={mediaItems} onDelete={handleDeleteMedia} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/5">
                  <Plus className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No media found in your library</p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>Upload your first media</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="mt-0 outline-none">
          <HashtagManager
            groups={hashtagGroups}
            onAdd={handleAddHashtag}
            onDelete={handleDeleteHashtag}
          />
        </TabsContent>

        <TabsContent value="descriptions" className="mt-0 outline-none">
          <CaptionLibrary
            templates={captionTemplates}
            onAdd={handleAddCaption}
            onDelete={handleDeleteCaption}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload images or videos to your content library to use them in your posts.
            </DialogDescription>
          </DialogHeader>
          <MediaUploader onUpload={() => {
            setIsUploadDialogOpen(false)
            loadLibraryData()
          }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
