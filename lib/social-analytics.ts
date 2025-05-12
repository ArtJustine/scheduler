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
