import { Info } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface PlatformDimensionsInfoProps {
  platform: string
}

export function PlatformDimensionsInfo({ platform }: PlatformDimensionsInfoProps) {
  const dimensionsInfo = {
    instagram: {
      "Feed Post": "1080 x 1080 px (1:1 square)",
      Portrait: "1080 x 1350 px (4:5 vertical)",
      Landscape: "1080 x 566 px (1.91:1 horizontal)",
      Stories: "1080 x 1920 px (9:16 vertical)",
      Reels: "1080 x 1920 px (9:16 vertical)",
    },
    youtube: {
      Thumbnail: "1280 x 720 px (16:9)",
      "Channel Cover": "2560 x 1440 px",
      "Profile Picture": "800 x 800 px",
    },
    tiktok: {
      Video: "1080 x 1920 px (9:16 vertical)",
      "Profile Picture": "200 x 200 px",
    },
  }

  const info = dimensionsInfo[platform as keyof typeof dimensionsInfo] || {}

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
        <Info className="mr-1 h-3 w-3" />
        Recommended dimensions
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium capitalize">{platform} Recommended Dimensions</h4>
          <Separator />
          <div className="space-y-2">
            {Object.entries(info).map(([type, dimensions]) => (
              <div key={type} className="grid grid-cols-2">
                <div className="text-sm font-medium">{type}</div>
                <div className="text-sm">{dimensions}</div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
