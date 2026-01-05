"use client"

import { useState } from "react"
import { Download, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MediaItem } from "@/types/media"

interface MediaGridProps {
  items: MediaItem[]
  onDelete?: (id: string) => void
}

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)

  const handleClose = () => {
    setSelectedItem(null)
  }

  const handleDelete = () => {
    if (selectedItem && onDelete) {
      onDelete(selectedItem.id)
      setSelectedItem(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border bg-background"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.url || "/placeholder.svg"}
              alt={item.fileName}
              className="h-full w-full object-cover transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/20">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.fileName}</DialogTitle>
            <DialogDescription>
              {selectedItem?.type} • {formatFileSize(selectedItem?.fileSize || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-hidden rounded-md border">
            <img
              src={selectedItem?.url || "/placeholder.svg"}
              alt={selectedItem?.fileName}
              className="max-h-[60vh] w-auto object-contain"
            />
          </div>
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
