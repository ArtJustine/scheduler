import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return {
        bg: "rgba(225, 48, 108, 0.1)",
        text: "#E1306C",
      }
    case "tiktok":
      return {
        bg: "rgba(0, 0, 0, 0.1)",
        text: "#000000",
      }
    case "youtube":
      return {
        bg: "rgba(255, 0, 0, 0.1)",
        text: "#FF0000",
      }
    default:
      return {
        bg: "rgba(113, 128, 150, 0.1)",
        text: "#718096",
      }
  }
}
