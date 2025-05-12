"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageIcon, FileVideo, Upload, X } from "lucide-react"

interface MediaUploaderProps {
  onFileSelected: (file: File | null) => void
  contentType: string
  platform: string
}

export function MediaUploader({ onFileSelected, contentType, platform }: MediaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (!file) {
      setPreview(null)
      setFileName(null)
      onFileSelected(null)
      return
    }

    setFileName(file.name)
    onFileSelected(file)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For videos, we could use a thumbnail or just show an icon
      setPreview(null)
    }
  }

  const clearFile = () => {
    setPreview(null)
    setFileName(null)
    onFileSelected(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getAcceptedFileTypes = () => {
    if (contentType === "image") return "image/*"
    if (contentType === "video" || contentType === "reel") return "video/*"
    return "image/*,video/*"
  }

  const isVideoContent = contentType === "video" || contentType === "reel"

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedFileTypes()}
        onChange={handleFileChange}
        className="hidden"
        id="media-upload"
      />

      {!preview && !fileName ? (
        <Card
          className="border-dashed border-2 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            {isVideoContent ? (
              <FileVideo className="h-6 w-6 text-primary" />
            ) : (
              <ImageIcon className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">{isVideoContent ? "Upload video" : "Upload image"}</p>
            <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
            <p className="text-xs text-muted-foreground">
              {isVideoContent ? "MP4, MOV or WebM (max 100MB)" : "PNG, JPG or WebP (max 10MB)"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="relative">
          {preview ? (
            <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-md">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
              <Button size="icon" variant="destructive" className="absolute top-2 right-2" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-md flex items-center">
              <FileVideo className="h-6 w-6 mr-2 text-muted-foreground" />
              <span className="flex-1 truncate">{fileName}</span>
              <Button size="icon" variant="ghost" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {preview || fileName ? "Change media" : "Select media"}
      </Button>
    </div>
  )
}
