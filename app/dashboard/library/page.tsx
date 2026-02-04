"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MediaGrid } from "@/components/dashboard/media-grid"
import { HashtagManager } from "@/components/dashboard/hashtag-manager"
import { CaptionLibrary } from "@/components/dashboard/caption-library"
import { getMediaLibrary, getHashtagGroups, getCaptionTemplates } from "@/lib/data-service"
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

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
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

    loadLibraryData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Library</h1>
        <p className="text-muted-foreground">Manage your media, hashtags, and caption templates</p>
      </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="captions">Captions</TabsTrigger>
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
        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Hashtag Groups</CardTitle>
                <CardDescription>Organize your hashtags for quick access</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <HashtagManager groups={hashtagGroups} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="captions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Caption Templates</CardTitle>
                <CardDescription>Save and reuse your best captions</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <CaptionLibrary templates={captionTemplates} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

