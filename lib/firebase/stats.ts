import { collection, query, where, getCountFromServer, doc, getDoc } from "firebase/firestore"
import { db, auth } from "./config"

export async function getUserStats(timeframe: string = "month") {
  if (!auth || !db) {
    return {
      overview: { totalPosts: 0, totalEngagement: 0, totalImpressions: 0, scheduledPosts: 0 },
      engagement: [],
      followers: [],
      impressions: [],
      platforms: { instagram: {}, youtube: {}, tiktok: {} }
    }
  }
  const user = auth.currentUser

  if (!user) {
    console.warn("User not authenticated for stats, returning empty data")
    return {
      overview: { totalPosts: 0, totalEngagement: 0, totalImpressions: 0, scheduledPosts: 0 },
      engagement: [],
      followers: [],
      impressions: [],
      platforms: { instagram: {}, youtube: {}, tiktok: {} }
    }
  }

  // Query for all social posts
  const socialPostsQuery = query(collection(db, "posts"), where("userId", "==", user.uid))
  const socialPostsSnapshot = await getCountFromServer(socialPostsQuery)
  const socialPosts = socialPostsSnapshot.data().count

  // Query for all blog posts
  const blogPostsQuery = query(collection(db, "blog_posts"))
  const blogPostsSnapshot = await getCountFromServer(blogPostsQuery)
  const totalBlogPosts = blogPostsSnapshot.data().count

  // Query for published blog posts
  const publishedBlogQuery = query(collection(db, "blog_posts"), where("status", "==", "published"))
  const publishedBlogSnapshot = await getCountFromServer(publishedBlogQuery)
  const publishedBlogPosts = publishedBlogSnapshot.data().count

  // Fetch social accounts to show real stats if connected
  let youtubeStats = { views: 0, videos: 0, comments: 0, likes: 0, followers: 0, engagement: 0, impressions: 0 }
  let instagramStats = { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }
  let tiktokStats = { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }

  try {
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)
    if (userDoc.exists()) {
      const userData = userDoc.data()
      if (userData.youtube) {
        youtubeStats = {
          views: Number(userData.youtube.views || 0),
          videos: Number(userData.youtube.videos || 0),
          comments: Number(userData.youtube.comments || 0),
          likes: Number(userData.youtube.likes || 0),
          followers: Number(userData.youtube.followers || 0),
          engagement: Number(userData.youtube.engagement || 0),
          impressions: Number(userData.youtube.impressions || 0),
        }
      }
      if (userData.instagram) {
        instagramStats = {
          engagement: Number(userData.instagram.engagement || 0),
          followers: Number(userData.instagram.followers || 0),
          impressions: Number(userData.instagram.impressions || 0),
          growth: Number(userData.instagram.growth || 0),
          likes: Number(userData.instagram.likes || 0),
          comments: Number(userData.instagram.comments || 0),
        }
      }
      if (userData.tiktok) {
        tiktokStats = {
          engagement: Number(userData.tiktok.engagement || 0),
          followers: Number(userData.tiktok.followers || 0),
          impressions: Number(userData.tiktok.impressions || 0),
          growth: Number(userData.tiktok.growth || 0),
          likes: Number(userData.tiktok.likes || 0),
          comments: Number(userData.tiktok.comments || 0),
        }
      }
    }
  } catch (e) {
    console.error("Error fetching social stats:", e)
  }

  // Build the data object with real stats
  const data: any = {
    overview: {
      totalPosts: socialPosts + totalBlogPosts,
      totalEngagement: ((youtubeStats.engagement + instagramStats.engagement + tiktokStats.engagement) / 3).toFixed(1),
      totalImpressions: youtubeStats.impressions + instagramStats.impressions + tiktokStats.impressions,
      scheduledPosts: 0, // Placeholder for now
      youtubeVideos: youtubeStats.videos,
      youtubeViews: youtubeStats.views,
      youtubeComments: youtubeStats.comments,
      youtubeLikes: youtubeStats.likes,
      publishedBlogPosts: publishedBlogPosts,
    },
    // Historical charts - currently empty as we don't store historical snapshots yet
    // In a full implementation, you'd fetch this from a 'historical_stats' collection
    engagement: [],
    followers: [],
    impressions: [],
    platforms: {
      instagram: instagramStats,
      youtube: youtubeStats,
      tiktok: tiktokStats
    }
  }

  return data
}
