"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Square, RectangleVertical, Monitor, Scissors } from "lucide-react"

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  open: boolean
}

const ASPECT_RATIOS = [
  { label: "1:1", value: 1, icon: Square },
  { label: "4:5", value: 4 / 5, icon: RectangleVertical },
  { label: "9:16", value: 9 / 16, icon: Monitor },
]

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  open,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(ASPECT_RATIOS[0].value)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const handleSave = async () => {
    try {
      const { default: getCroppedImg } = await import("@/lib/image-crop")
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[400px] w-full bg-muted rounded-md overflow-hidden mt-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
          />
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-center gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <Button
                key={ratio.label}
                variant={aspect === ratio.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAspect(ratio.value)}
                className="flex items-center gap-2"
              >
                <ratio.icon className="h-4 w-4" />
                {ratio.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Crop & Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
