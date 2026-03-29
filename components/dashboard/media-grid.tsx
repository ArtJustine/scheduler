"use client"

import React, { useState } from "react"
import { CheckCircle2, Download, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/types/media"

interface MediaGridProps {
  items: MediaItem[]
  onDelete?: (id: string) => void
  onDeleteMultiple?: (ids: string[]) => void
}

export function MediaGrid({ items, onDelete, onDeleteMultiple }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const handleClose = () => {
    setSelectedItem(null)
  }

  const handleDelete = () => {
    if (selectedItem && onDelete) {
      onDelete(selectedItem.id)
      setSelectedItem(null)
    }
  }

  const handleDeleteMultiple = () => {
    if (onDeleteMultiple && selectedIds.size > 0) {
      onDeleteMultiple(Array.from(selectedIds))
      setSelectedIds(new Set())
      setIsSelectionMode(false)
    }
  }

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    if (newSelected.size === 0) {
      setIsSelectionMode(false)
    }
  }

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedIds(new Set())
    }
    setIsSelectionMode(!isSelectionMode)
  }

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(item => item.id)))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border">
        <div className="flex items-center gap-2 px-2">
          {isSelectionMode ? (
            <>
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-8">
                {selectedIds.size === items.length ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-xs text-muted-foreground ml-2">
                {selectedIds.size} selected
              </span>
            </>
          ) : (
            <span className="text-sm font-medium">Media Files</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 gap-2" 
                onClick={handleDeleteMultiple}
                disabled={selectedIds.size === 0}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected
              </Button>
              <Button variant="ghost" size="sm" className="h-8" onClick={toggleSelectionMode}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-8 gap-2" onClick={toggleSelectionMode}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Select Multiple
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id)
          return (
            <div
              key={item.id}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-all",
                isSelected ? "ring-2 ring-primary border-primary" : "bg-muted/20 hover:border-primary/50"
              )}
              onClick={() => isSelectionMode ? toggleSelection(item.id) : setSelectedItem(item)}
            >
              {isSelectionMode && (
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => toggleSelection(item.id)}
                    className="bg-white/80 data-[state=checked]:bg-primary"
                  />
                </div>
              )}

              {item.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900">
                  <video src={item.url} className="h-full w-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.fileName}
                  className="h-full w-full object-cover transition-all group-hover:scale-105"
                />
              )}
              
              {!isSelectionMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-none bg-white/20 hover:bg-white/40">
                    <Download className="h-4 w-4 text-white" />
                    <span className="sr-only">View</span>
                  </Button>
                </div>
              )}

              {isSelected && (
                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{selectedItem?.fileName}</DialogTitle>
            <DialogDescription>
              {selectedItem?.type} • {formatFileSize(selectedItem?.fileSize || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-hidden rounded-md border bg-muted/10">
            {selectedItem?.type === "video" ? (
              <video
                src={selectedItem.url}
                controls
                className="max-h-[60vh] w-full"
              />
            ) : (
              <img
                src={selectedItem?.url || "/placeholder.svg"}
                alt={selectedItem?.fileName}
                className="max-h-[60vh] w-auto object-contain"
              />
            )}
          </div>
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={selectedItem?.url} download={selectedItem?.fileName} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

