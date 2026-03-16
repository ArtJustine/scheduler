import { config } from "./config"

export async function fetchYouTubeStats(accessToken: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    if (!response.ok) return null

    const data = await response.json()
    if (data.items && data.items.length > 0) {
      const stats = data.items[0].statistics
      return {
        followers: parseInt(stats.subscriberCount || "0"),
        posts: parseInt(stats.videoCount || "0"),
        views: parseInt(stats.viewCount || "0"),
      }
    }
    return null
  } catch (err) {
    console.error("fetchYouTubeStats error:", err)
    return null
  }
}

export async function fetchTikTokStats(accessToken: string) {
  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,video_count,likes_count",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    if (!response.ok) return null

    const resData = await response.json()
    if (resData.data && resData.data.user) {
      const u = resData.data.user
      return {
        followers: u.follower_count || 0,
        posts: u.video_count || 0,
        likes: u.likes_count || 0,
      }
    }
    return null
  } catch (err) {
    console.error("fetchTikTokStats error:", err)
    return null
  }
}

export async function fetchInstagramStats(accessToken: string, igUserId: string) {
  try {
    // Requires instagram_basic and instagram_manage_insights
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}?fields=followers_count,media_count,name&access_token=${accessToken}`
    )
    if (!response.ok) return null

    const data = await response.json()
    return {
      followers: data.followers_count || 0,
      posts: data.media_count || 0,
    }
  } catch (err) {
    console.error("fetchInstagramStats error:", err)
    return null
  }
}
