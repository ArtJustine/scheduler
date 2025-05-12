"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, Download, Trash2, ImageIcon, Video } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { deleteMediaFromLibrary } from "@/lib/firebase/media"
import type { MediaItem } from "@/types/media"

interface MediaGridProps {
  items: MediaItem[]
}

export function MediaGrid({ items }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL copied",
      description: "Media URL has been copied to clipboard",
    })
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteMediaFromLibrary(id)
      toast({
        title: "Media deleted",
        description: "The media has been removed from your library",
      })
      setSelectedMedia(null)
      // You would typically update the parent component's state here
      // by passing a callback function from the parent
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was a problem deleting the media",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedMedia(item)}
          >
            <div className="aspect-square relative">
              {item.type === "image" ? (
                <img src={item.url || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  {item.type === "image" ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.title}</DialogTitle>
            <DialogDescription>
              Added on {selectedMedia?.createdAt ? new Date(selectedMedia.createdAt).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMedia?.type === "image" ? (
              <div className="overflow-hidden rounded-md">
                <img
                  src={selectedMedia.url || "/placeholder.svg"}
                  alt={selectedMedia.title}
                  className="w-full object-contain max-h-[300px]"
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-md">
                <video src={selectedMedia?.url} controls className="w-full max-h-[300px]" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => selectedMedia && handleCopyUrl(selectedMedia.url)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => selectedMedia && window.open(selectedMedia.url, "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => selectedMedia && handleDelete(selectedMedia.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
