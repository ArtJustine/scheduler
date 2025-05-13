import type { SocialAccounts } from "@/types/social"

export function getTotalFollowers(accounts: SocialAccounts) {
  let total = 0
  if (accounts.instagram) {
    total += accounts.instagram.followers || 0
  }
  if (accounts.tiktok) {
    total += accounts.tiktok.followers || 0
  }
  if (accounts.youtube) {
    total += accounts.youtube.followers || 0
  }
  return total
}

export function getAverageEngagement(accounts: SocialAccounts) {
  let total = 0
  let count = 0

  if (accounts.instagram) {
    total += accounts.instagram.engagement || 0
    count += 1
  }
  if (accounts.tiktok) {
    total += accounts.tiktok.engagement || 0
    count += 1
  }
  if (accounts.youtube) {
    total += accounts.youtube.engagement || 0
    count += 1
  }

  return count > 0 ? total / count : 0
}

export function getTotalImpressions(accounts: SocialAccounts) {
  let total = 0
  if (accounts.instagram) {
    total += accounts.instagram.impressions || 0
  }
  if (accounts.tiktok) {
    total += accounts.tiktok.impressions || 0
  }
  if (accounts.youtube) {
    total += accounts.youtube.impressions || 0
  }
  return total
}

export function getConnectedPlatformsCount(accounts: SocialAccounts) {
  let count = 0
  if (accounts.instagram) count += 1
  if (accounts.tiktok) count += 1
  if (accounts.youtube) count += 1
  return count
}

export function generateChartData(accounts: SocialAccounts) {
  // Generate mock data for charts based on current follower counts
  return {
    instagram: Array(6)
      .fill(0)
      .map((_, i) => {
        const baseValue = accounts.instagram?.followers || 400
        const monthValue = baseValue - (5 - i) * (baseValue * 0.1 * Math.random())
        return {
          date: getMonthName(i),
          value: Math.round(monthValue),
        }
      }),
    tiktok: Array(6)
      .fill(0)
      .map((_, i) => {
        const baseValue = accounts.tiktok?.followers || 1000
        const monthValue = baseValue - (5 - i) * (baseValue * 0.15 * Math.random())
        return {
          date: getMonthName(i),
          value: Math.round(monthValue),
        }
      }),
    youtube: Array(6)
      .fill(0)
      .map((_, i) => {
        const baseValue = accounts.youtube?.followers || 200
        const monthValue = baseValue - (5 - i) * (baseValue * 0.08 * Math.random())
        return {
          date: getMonthName(i),
          value: Math.round(monthValue),
        }
      }),
  }
}

function getMonthName(monthsAgo: number) {
  const date = new Date()
  date.setMonth(date.getMonth() - 5 + monthsAgo)
  return date.toLocaleString("default", { month: "short" })
}

// Generate mock analytics data for demonstration purposes
export function generateAnalyticsData(platform: string, days = 30) {
  const data = []
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Format date as MM/DD
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`

    // Generate random values based on platform
    let baseValue = 0
    let growth = 0

    switch (platform.toLowerCase()) {
      case "instagram":
        baseValue = 1000 + Math.random() * 500
        growth = 0.05 + Math.random() * 0.1
        break
      case "tiktok":
        baseValue = 2000 + Math.random() * 1000
        growth = 0.1 + Math.random() * 0.2
        break
      case "youtube":
        baseValue = 500 + Math.random() * 300
        growth = 0.02 + Math.random() * 0.05
        break
      default:
        baseValue = 100 + Math.random() * 100
        growth = 0.01 + Math.random() * 0.03
    }

    // Apply growth trend over time
    const value = Math.round(baseValue * (1 + (growth * (days - i)) / days))

    data.push({
      date: formattedDate,
      value,
    })
  }

  return data
}

export function generateEngagementData(platform: string, days = 30) {
  const data = []
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Format date as MM/DD
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`

    // Generate random engagement rate based on platform
    let baseRate = 0

    switch (platform.toLowerCase()) {
      case "instagram":
        baseRate = 2 + Math.random() * 3 // 2-5%
        break
      case "tiktok":
        baseRate = 5 + Math.random() * 10 // 5-15%
        break
      case "youtube":
        baseRate = 1 + Math.random() * 2 // 1-3%
        break
      default:
        baseRate = 0.5 + Math.random() * 1.5 // 0.5-2%
    }

    // Add some daily variation
    const dailyVariation = (Math.random() - 0.5) * 0.5
    const value = baseRate + dailyVariation

    data.push({
      date: formattedDate,
      value: Number.parseFloat(value.toFixed(2)),
    })
  }

  return data
}

export function getAnalyticsOverview(platform: string) {
  // Generate platform-specific overview stats
  switch (platform.toLowerCase()) {
    case "instagram":
      return {
        followers: 10000 + Math.floor(Math.random() * 5000),
        engagement: 3.2 + Math.random() * 1.5,
        posts: 120 + Math.floor(Math.random() * 30),
        impressions: 250000 + Math.floor(Math.random() * 50000),
        reach: 150000 + Math.floor(Math.random() * 30000),
      }
    case "tiktok":
      return {
        followers: 25000 + Math.floor(Math.random() * 10000),
        engagement: 8.5 + Math.random() * 3,
        posts: 80 + Math.floor(Math.random() * 20),
        impressions: 500000 + Math.floor(Math.random() * 100000),
        reach: 350000 + Math.floor(Math.random() * 70000),
      }
    case "youtube":
      return {
        followers: 5000 + Math.floor(Math.random() * 2000),
        engagement: 2.1 + Math.random() * 1,
        posts: 45 + Math.floor(Math.random() * 15),
        impressions: 100000 + Math.floor(Math.random() * 30000),
        reach: 70000 + Math.floor(Math.random() * 20000),
      }
    default:
      return {
        followers: 1000 + Math.floor(Math.random() * 500),
        engagement: 1.5 + Math.random() * 0.8,
        posts: 30 + Math.floor(Math.random() * 10),
        impressions: 20000 + Math.floor(Math.random() * 5000),
        reach: 15000 + Math.floor(Math.random() * 3000),
      }
  }
}
