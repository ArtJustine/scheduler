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

interface MediaUploaderProps {
  onUpload: (url: string) => void
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    const file = files[0]
    if (!file) return

    // Check if file is an image or video
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      })
      return
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 100MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log("Initiating upload for file:", file.name, "size:", file.size)

      const user = firebaseAuth?.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      if (!firebaseStorage) {
        throw new Error("Storage not initialized")
      }

      // Upload to Firebase Storage
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const storageRef = ref(firebaseStorage, `media/${user.uid}/${fileName}`)
      console.log("Storage ref created:", storageRef.fullPath)

      const uploadTask = uploadBytesResumable(storageRef, file)

      // Use a promise to handle the upload completion/error more robustly
      await new Promise<void>((resolve, reject) => {
        // Safety timeout - if no progress after 30 seconds and still at 0, fail it
        const timeout = setTimeout(() => {
          if (uploadProgress === 0) {
            console.error("Upload timed out at 0% progress")
            uploadTask.cancel()
            reject(new Error("Upload timed out. Please check your connection and try again."))
          }
        }, 30000)

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log(`Upload progress: ${Math.round(progress)}%`)
            setUploadProgress(progress)
          },
          (error) => {
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
              onUpload(downloadURL)
              toast({
                title: "Upload successful",
                description: "Media uploaded successfully",
              })
              resolve()
            } catch (err) {
              console.error("Error getting download URL:", err)
              reject(err)
            }
          }
        )
      })
    } catch (error: any) {
      console.error("Detailed upload failure:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload media. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      console.log("Media upload process finalized")
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
    </div>
  )
}
