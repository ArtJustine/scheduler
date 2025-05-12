"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { MediaGrid } from "@/components/dashboard/media-grid"
import { HashtagManager } from "@/components/dashboard/hashtag-manager"
import { CaptionLibrary } from "@/components/dashboard/caption-library"
import { Plus, Search, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getMediaLibrary, uploadMediaToLibrary } from "@/lib/firebase/media"
import type { MediaItem } from "@/types/media"

export default function LibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mediaTitle, setMediaTitle] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const { toast } = useToast()

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const media = await getMediaLibrary()
        setMediaItems(media)
      } catch (error) {
        console.error("Error loading media library:", error)
        toast({
          variant: "destructive",
          title: "Failed to load media",
          description: "There was a problem loading your media library.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMedia()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-detect media type
      setMediaType(file.type.startsWith("image/") ? "image" : "video")
      // Use filename as default title (without extension)
      const fileName = file.name.split(".").slice(0, -1).join(".")
      setMediaTitle(fileName)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !mediaTitle) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a title and select a file to upload.",
      })
      return
    }

    setUploadingMedia(true)

    try {
      const newMedia = await uploadMediaToLibrary({
        file: selectedFile,
        title: mediaTitle,
        type: mediaType,
      })

      setMediaItems((prev) => [newMedia, ...prev])

      toast({
        title: "Media uploaded",
        description: "Your media has been added to the library.",
      })

      // Reset form
      setSelectedFile(null)
      setMediaTitle("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your media.",
      })
    } finally {
      setUploadingMedia(false)
    }
  }

  const filteredMedia = mediaItems.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground">Manage your media assets, hashtags, and captions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Media Library</DialogTitle>
              <DialogDescription>Upload images or videos to your content library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your media"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media">Media File</Label>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input id="media" type="file" accept="image/*,video/*" onChange={handleFileChange} />
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploadingMedia || !selectedFile}>
                {uploadingMedia ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="media" className="space-y-6">
        <TabsList>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="captions">Captions</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>Manage your images and videos</CardDescription>
                </div>
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search media..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredMedia.length > 0 ? (
                <MediaGrid items={filteredMedia} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No media found</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Media Library</DialogTitle>
                        <DialogDescription>Upload images or videos to your content library</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter a title for your media"
                            value={mediaTitle}
                            onChange={(e) => setMediaTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="media">Media File</Label>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Input id="media" type="file" accept="image/*,video/*" onChange={handleFileChange} />
                          </div>
                          {selectedFile && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedFile(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={uploadingMedia || !selectedFile}>
                          {uploadingMedia ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hashtag Manager</CardTitle>
              <CardDescription>Create and organize hashtag groups for your posts</CardDescription>
            </CardHeader>
            <CardContent>
              <HashtagManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Caption Templates</CardTitle>
              <CardDescription>Save and reuse caption templates for your posts</CardDescription>
            </CardHeader>
            <CardContent>
              <CaptionLibrary />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
