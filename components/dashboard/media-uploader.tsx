"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ImageIcon, Film } from "lucide-react"

interface MediaUploaderProps {
  onUpload: (url: string) => void
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Check if file is an image or video
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Please upload an image or video file")
      return
    }

    // Mock upload process
    setIsUploading(true)

    // Create a local URL for the file
    const url = URL.createObjectURL(file)

    // Simulate upload delay
    setTimeout(() => {
      onUpload(url)
      setIsUploading(false)
    }, 1500)
  }

  return (
    <div>
      <Card
        className={`border-2 border-dashed p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Drag and drop your media here</p>
            <p className="text-xs text-muted-foreground">Supports images and videos up to 100MB</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={isUploading}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <label className="cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
              </label>
            </Button>
            <Button size="sm" variant="outline" disabled={isUploading}>
              <Film className="mr-2 h-4 w-4" />
              <label className="cursor-pointer">
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
              </label>
            </Button>
          </div>
        </div>
      </Card>
      {isUploading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="ml-2 text-sm">Uploading...</span>
        </div>
      )}
    </div>
  )
}
