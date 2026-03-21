"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ImageIcon, Film } from "lucide-react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { useToast } from "@/components/ui/use-toast"
import { firebaseAuth, firebaseStorage } from "@/lib/firebase-client"
import { Progress } from "@/components/ui/progress"
import { registerMediaMetadata } from "@/lib/firebase/media"
import { ImageCropper } from "./image-cropper"

interface MediaUploaderProps {
  onUpload: (media: { url: string; type: "image" | "video" }[]) => void
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cropOpen, setCropOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<{ url: string; file: File } | null>(null)
  const { toast } = useToast()

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

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    const firstFile = files[0]
    const isVideo = firstFile.type.startsWith("video/")
    const isImage = firstFile.type.startsWith("image/")

    if (!isVideo && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      })
      return
    }

    // If it's a video, only allow one
    if (isVideo && files.length > 1) {
      toast({
        title: "Single video only",
        description: "You can only upload one video at a time. Highlighting the first video selected.",
        variant: "default",
      })
    }

    const filesToUpload = isVideo ? [firstFile] : Array.from(files).filter(f => f.type.startsWith("image/"))

    if (filesToUpload.length === 0) return

    // Check file sizes
    const maxSize = 100 * 1024 * 1024 // 100MB
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File(s) too large",
        description: "Some files are larger than 100MB and will be skipped.",
        variant: "destructive",
      })
    }

    const validFiles = filesToUpload.filter(f => f.size <= maxSize)
    if (validFiles.length === 0) return

    // If single image, allow cropping
    if (validFiles.length === 1 && validFiles[0].type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageToCrop({ url: reader.result as string, file: validFiles[0] })
        setCropOpen(true)
      }
      reader.readAsDataURL(validFiles[0])
    } else {
      // Multiple images or a video - upload directly
      const uploadedMedia: { url: string; type: "image" | "video" }[] = []
      
      setIsUploading(true)
      for (const file of validFiles) {
        try {
          const result = await uploadFile(file, file.name)
          if (result) {
            uploadedMedia.push(result)
          }
        } catch (error) {
          console.error("Error uploading file:", file.name, error)
        }
      }
      setIsUploading(false)

      if (uploadedMedia.length > 0) {
        onUpload(uploadedMedia)
      }
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropOpen(false)
    if (imageToCrop) {
      const result = await uploadFile(croppedBlob, imageToCrop.file.name)
      if (result) {
        onUpload([result])
      }
    }
    setImageToCrop(null)
  }

  const uploadFile = async (file: File | Blob, originalName: string): Promise<{ url: string; type: "image" | "video" } | null> => {
    setUploadProgress(0)

    try {
      console.log("Initiating upload for file:", originalName, "size:", file.size)

      const user = firebaseAuth?.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      if (!firebaseStorage) {
        throw new Error("Storage not initialized")
      }

      // Upload to Firebase Storage
      const timestamp = Date.now()
      const fileName = `${timestamp}_${originalName}`
      const storageRef = ref(firebaseStorage, `media/${user.uid}/${fileName}`)
      console.log("Storage ref created:", storageRef.fullPath)

      const uploadTask = uploadBytesResumable(storageRef, file)
      let lastProgressUpdate = 0

      // Use a promise to handle the upload completion/error more robustly
      return await new Promise<{ url: string; type: "image" | "video" } | null>((resolve, reject) => {
        // Safety timeout - if no progress after 30 seconds, fail it
        const timeout = setTimeout(() => {
          if (lastProgressUpdate === 0) {
            console.error("Upload timed out at 0% progress")
            uploadTask.cancel()
            reject(new Error("Upload timed out at 0%. Please check your connection and try again."))
          }
        }, 30000)

        uploadTask.on(
          "state_changed",
          (snapshot: any) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            lastProgressUpdate = progress
            console.log(`Upload progress for ${originalName}: ${Math.round(progress)}%`)
            setUploadProgress(progress)
          },
          (error: any) => {
            clearTimeout(timeout)
            console.error("Firebase Storage upload error:", error)
            reject(error)
          },
          async () => {
            clearTimeout(timeout)
            try {
              console.log("Upload task completed successfully")
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              console.log("Download URL obtained:", downloadURL)

              const type = originalName.toLowerCase().match(/\.(mp4|mov|avi|webm)$/) ? "video" : "image"

              // Register in library
              try {
                await registerMediaMetadata({
                  url: downloadURL,
                  title: originalName,
                  type: type,
                  fileName: originalName,
                  fileSize: file.size,
                  storagePath: storageRef.fullPath,
                })
              } catch (regError) {
                console.error("Failed to register media in library:", regError)
              }

              toast({
                title: "Upload successful",
                description: `${originalName} uploaded and saved to library`,
              })
              resolve({ url: downloadURL, type })
            } catch (err) {
              console.error("Error getting download URL:", err)
              reject(err)
            }
          }
        )
      })
    } catch (error: any) {
      console.error("Detailed upload failure:", error)
      let errorMessage = error.message || "Failed to upload media. Please try again."

      // Handle specific Firebase Storage errors
      if (error.code === 'storage/unauthorized') {
        errorMessage = "Permission denied. Please check Firebase Storage rules."
      } else if (error.code === 'storage/unknown' || error.message?.includes('network')) {
        errorMessage = "Network error. This is likely a CORS issue. Please configure CORS for your storage bucket."
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage = "Upload timed out. Please check your internet connection."
      }

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setUploadProgress(0)
    }
  }

  return (
    <div>
      <Card
        className={`border-2 border-dashed p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
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
            <Button size="sm" variant="outline" disabled={isUploading} className="relative">
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileInput}
                disabled={isUploading}
              />
            </Button>
          </div>
        </div>
      </Card>
      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
              <span>Uploading...</span>
            </div>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1 shadow-sm" />
        </div>
      )}

      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop.url}
          open={cropOpen}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropOpen(false)
            setImageToCrop(null)
          }}
        />
      )}
    </div>
  )
}
