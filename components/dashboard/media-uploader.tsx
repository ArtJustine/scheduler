"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MediaUploaderProps {
  onUpload?: (file: File) => void
  accept?: string
  maxSize?: number
}

export function MediaUploader({ onUpload, accept = "image/*", maxSize = 5 * 1024 * 1024 }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    // Check file type
    if (!file.type.match(accept.replace("*", "."))) {
      setError(`File type not supported. Please upload ${accept} files.`)
      return
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Call onUpload callback
    if (onUpload) {
      onUpload(file)
    }
  }

  const clearPreview = () => {
    setPreview(null)
  }

  return (
    <Card>
      <CardContent className="p-4">
        {preview ? (
          <div className="relative">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-64 w-full rounded-md object-contain" />
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80"
              onClick={clearPreview}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ) : (
          <div
            className={`flex h-64 flex-col items-center justify-center rounded-md border border-dashed p-4 transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Drag & drop your file here</p>
                <p className="text-xs text-muted-foreground">
                  Supports {accept.replace("*", "")} files up to {maxSize / 1024 / 1024}MB
                </p>
              </div>
              <Label
                htmlFor="media-upload"
                className="cursor-pointer rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
              >
                Browse Files
              </Label>
              <Input id="media-upload" type="file" accept={accept} onChange={handleChange} className="hidden" />
            </div>
          </div>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
