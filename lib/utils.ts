import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const offset = -d.getTimezoneOffset() / 60
  const offsetStr = `GMT${offset >= 0 ? "+" : ""}${offset}`

  return `${time} ${offsetStr}`
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return `${formatDate(d)} at ${formatTime(d)}`
}

export function getPlatformColor(platform: string) {
  if (!platform) {
    return {
      bg: "rgba(113, 113, 122, 0.1)",
      text: "#71717A",
    }
  }

  switch (platform.toLowerCase()) {
    case "instagram":
      return {
        bg: "rgba(195, 42, 163, 0.1)",
        text: "#C32AA3",
      }
    case "youtube":
      return {
        bg: "rgba(255, 0, 0, 0.1)",
        text: "#FF0000",
      }
    case "tiktok":
      return {
        bg: "rgba(0, 0, 0, 0.1)",
        text: "#000000",
      }
    default:
      return {
        bg: "rgba(113, 113, 122, 0.1)",
        text: "#71717A",
      }
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// Use UUID instead of Math.random
export function generateRandomId(): string {
  return uuidv4().substring(0, 12)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Use a deterministic approach instead of Math.random
export function getRandomInt(min: number, max: number): number {
  // Use a hash of the current timestamp for "randomness"
  const timestamp = new Date().getTime()
  const hash = timestamp % (max - min + 1)
  return min + hash
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function getInitials(name: string): string {
  if (!name) return "U"

  const parts = name.split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
