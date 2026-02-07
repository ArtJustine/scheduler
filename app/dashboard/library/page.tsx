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
import {
  getMediaLibrary,
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
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "media"
  const [activeTab, setActiveTab] = useState(tabParam)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const loadLibraryData = async () => {
    try {
      setIsLoading(true)
      const [media, hashtags, captions] = await Promise.all([
        getMediaLibrary(),
        getHashtagGroups(),
        getCaptionTemplates(),
      ])
      setMediaItems(media)
      setHashtagGroups(hashtags)
      setCaptionTemplates(captions)
    } catch (error) {
      console.error("Error loading library data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDescription = async (data: any) => {
    try {
      await createCaption(data.title, data.content)
      await loadLibraryData()
    } catch (error) {
      console.error("Error adding description:", error)
    }
  }

  const handleDeleteDescription = async (id: string) => {
    try {
      await deleteCaption(id)
      setCaptionTemplates(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error("Error deleting description:", error)
    }
  }

  const handleAddHashtags = async (data: any) => {
    try {
      await createHashtag(data.name, data.hashtags)
      await loadLibraryData()
    } catch (error) {
      console.error("Error adding hashtags:", error)
    }
  }

  const handleDeleteHashtags = async (id: string) => {
    try {
      await deleteHashtag(id)
      setHashtagGroups(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error("Error deleting hashtags:", error)
    }
  }

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    loadLibraryData()
  }, [])

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
                <MediaGrid items={mediaItems} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/5">
                  <Plus className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">No media found in your library</p>
                  <Button variant="link" size="sm" className="mt-2 text-primary" onClick={() => setIsUploadDialogOpen(true)}>
                    Upload your first file
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Upload images or videos to use in your posts.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <MediaUploader onUpload={() => {
                  setIsUploadDialogOpen(false)
                  loadLibraryData()
                }} />
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="hashtags" className="mt-0 outline-none">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <HashtagManager
              groups={hashtagGroups}
              onAdd={handleAddHashtags}
              onDelete={handleDeleteHashtags}
            />
          )}
        </TabsContent>

        <TabsContent value="descriptions" className="mt-0 outline-none">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <CaptionLibrary
              templates={captionTemplates}
              onAdd={handleAddDescription}
              onDelete={handleDeleteDescription}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
