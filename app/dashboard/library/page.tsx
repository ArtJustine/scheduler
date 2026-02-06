"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MediaGrid } from "@/components/dashboard/media-grid"
import { CaptionLibrary } from "@/components/dashboard/caption-library"
import {
  getMediaLibrary,
  getCaptionTemplates,
  createCaption,
  deleteCaption
} from "@/lib/data-service"
import type { MediaItem } from "@/types/media"
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
  const [captionTemplates, setCaptionTemplates] = useState<CaptionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "media"
  const [activeTab, setActiveTab] = useState(tabParam)

  const loadLibraryData = async () => {
    try {
      setIsLoading(true)
      const [media, captions] = await Promise.all([
        getMediaLibrary(),
        getCaptionTemplates(),
      ])
      setMediaItems(media)
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Library</h1>
        <p className="text-muted-foreground">Manage your media and description templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>Manage your images and videos</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <MediaGrid items={mediaItems} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="descriptions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Description Templates</CardTitle>
                <CardDescription>Save and reuse your best descriptions and hashtags</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <CaptionLibrary
                  templates={captionTemplates}
                  onAdd={handleAddDescription}
                  onDelete={handleDeleteDescription}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
