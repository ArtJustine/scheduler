import { v4 as uuidv4 } from "uuid"
import type { SocialAccounts } from "@/types/social"

// Fixed data generation without using problematic random numbers
export function getAnalyticsData() {
  const platforms = ["Instagram", "YouTube", "TikTok"]
  const colors = ["#C32AA3", "#FF0000", "#000000"]

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })

  return platforms.map((platform, index) => {
    // Use deterministic values instead of random ones
    const baseValue = 1000 * (index + 1)
    const growth = 50 * (index + 1)

    return {
      id: uuidv4(),
      name: platform,
      color: colors[index],
      data: dates.map((date, i) => ({
        date,
        value: baseValue + growth * i,
      })),
    }
  })
}

export function getPlatformStats() {
  return [
    {
      id: "1",
      platform: "Instagram",
      followers: 12500,
      followersGrowth: 5.2,
      engagement: 3.8,
      impressions: 45000,
    },
    {
      id: "2",
      platform: "YouTube",
      followers: 38000,
      followersGrowth: 2.7,
      engagement: 4.5,
      impressions: 120000,
    },
    {
      id: "3",
      platform: "TikTok",
      followers: 56000,
      followersGrowth: 8.3,
      engagement: 6.2,
      impressions: 250000,
    },
  ]
}

export function getEngagementData() {
  return [
    {
      id: "1",
      platform: "Instagram",
      likes: 8500,
      comments: 1200,
      shares: 950,
      saves: 750,
    },
    {
      id: "2",
      platform: "YouTube",
      likes: 15000,
      comments: 2800,
      shares: 1500,
      saves: 0,
    },
    {
      id: "3",
      platform: "TikTok",
      likes: 45000,
      comments: 3500,
      shares: 12000,
      saves: 8000,
    },
  ]
}

export const getTotalFollowers = (accounts: SocialAccounts): number => {
  let total = 0
  if (accounts.instagram && accounts.instagram.followers) {
    total += accounts.instagram.followers
  }
  if (accounts.youtube && accounts.youtube.followers) {
    total += accounts.youtube.followers
  }
  if (accounts.tiktok && accounts.tiktok.followers) {
    total += accounts.tiktok.followers
  }
  return total
}

export const getAverageEngagement = (accounts: SocialAccounts): number => {
  let totalEngagement = 0
  let count = 0

  if (accounts.instagram && accounts.instagram.engagement) {
    totalEngagement += accounts.instagram.engagement
    count++
  }
  if (accounts.youtube && accounts.youtube.engagement) {
    totalEngagement += accounts.youtube.engagement
    count++
  }
  if (accounts.tiktok && accounts.tiktok.engagement) {
    totalEngagement += accounts.tiktok.engagement
    count++
  }

  return count > 0 ? totalEngagement / count : 0
}

export const getTotalImpressions = (accounts: SocialAccounts): number => {
  let total = 0
  if (accounts.instagram && accounts.instagram.impressions) {
    total += accounts.instagram.impressions
  }
  if (accounts.youtube && accounts.youtube.impressions) {
    total += accounts.youtube.impressions
  }
  if (accounts.tiktok && accounts.tiktok.impressions) {
    total += accounts.tiktok.impressions
  }
  return total
}

interface ChartDataPoint {
  date: string
  [key: string]: number
}

interface ChartSeries {
  name: string
  data: { date: string; value: number }[]
  color: string
}

export const generateChartData = (accounts: SocialAccounts): ChartSeries[] => {
  const mockChartData = {
    instagram: [
      { date: "Jan", value: 400 },
      { date: "Feb", value: 600 },
      { date: "Mar", value: 500 },
      { date: "Apr", value: 700 },
      { date: "May", value: 900 },
      { date: "Jun", value: 1100 },
    ],
    tiktok: [
      { date: "Jan", value: 1000 },
      { date: "Feb", value: 1500 },
      { date: "Mar", value: 2000 },
      { date: "Apr", value: 3500 },
      { date: "May", value: 4200 },
      { date: "Jun", value: 5000 },
    ],
    youtube: [
      { date: "Jan", value: 200 },
      { date: "Feb", value: 300 },
      { date: "Mar", value: 250 },
      { date: "Apr", value: 400 },
      { date: "May", value: 500 },
      { date: "Jun", value: 600 },
    ],
  }

  const chartSeries: ChartSeries[] = []

  if (accounts.instagram) {
    chartSeries.push({
      name: "Instagram",
      data: mockChartData.instagram,
      color: "#E1306C",
    })
  }

  if (accounts.tiktok) {
    chartSeries.push({
      name: "TikTok",
      data: mockChartData.tiktok,
      color: "#000000",
    })
  }

  if (accounts.youtube) {
    chartSeries.push({
      name: "YouTube",
      data: mockChartData.youtube,
      color: "#FF0000",
    })
  }

  return chartSeries
}
