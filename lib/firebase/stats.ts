import { collection, query, where, getCountFromServer, doc, getDoc } from "firebase/firestore"
import { db, auth } from "./config"

export async function getUserStats(timeframe: string = "month") {
  if (!auth || !db) {
    return {
      overview: { totalPosts: 0, totalEngagement: 0, totalImpressions: 0, scheduledPosts: 0 },
      engagement: [],
      followers: [],
      impressions: [],
      platforms: {
        instagram: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 },
        youtube: { views: 0, videos: 0, comments: 0, likes: 0, followers: 0, engagement: 0, impressions: 0 },
        tiktok: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }
      }
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
      platforms: {
        instagram: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 },
        youtube: { views: 0, videos: 0, comments: 0, likes: 0, followers: 0, engagement: 0, impressions: 0 },
        tiktok: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }
      }
    }
  }

  try {
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
    let threadsStats = { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }
    let facebookStats = { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }

    try {
      const { getActiveWorkspace } = await import("./workspaces")
      const workspace = await getActiveWorkspace(user.uid)
      let accounts: any = {}

      if (workspace && workspace.accounts) {
        accounts = workspace.accounts
      } else {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          accounts = userDoc.data()
        }
      }

      const normalize = (plat: any) => ({
        views: Number(plat?.views || 0),
        videos: Number(plat?.videos || plat?.posts || 0),
        comments: Number(plat?.comments || 0),
        likes: Number(plat?.likes || 0),
        followers: Number(plat?.followers || plat?.follower_count || plat?.followers_count || 0),
        engagement: Number(plat?.engagement || 0),
        impressions: Number(plat?.impressions || 0),
        growth: Number(plat?.growth || 0),
      })

      if (accounts.youtube) youtubeStats = normalize(accounts.youtube)
      if (accounts.instagram) instagramStats = normalize(accounts.instagram)
      if (accounts.tiktok) tiktokStats = normalize(accounts.tiktok)
      if (accounts.threads) threadsStats = normalize(accounts.threads)
      if (accounts.facebook) facebookStats = normalize(accounts.facebook)

    } catch (e) {
      console.error("Error fetching social stats:", e)
    }

    // Build the data object with real stats
    const data: any = {
      overview: {
        totalPosts: socialPosts + totalBlogPosts,
        totalEngagement: ((youtubeStats.engagement + instagramStats.engagement + tiktokStats.engagement + threadsStats.engagement) / 4).toFixed(1),
        totalImpressions: youtubeStats.impressions + instagramStats.impressions + tiktokStats.impressions + threadsStats.impressions,
        scheduledPosts: 0, // Placeholder for now
        youtubeVideos: youtubeStats.videos,
        youtubeViews: youtubeStats.views,
        youtubeComments: youtubeStats.comments,
        youtubeLikes: youtubeStats.likes,
        publishedBlogPosts: publishedBlogPosts,
      },
      // Historical charts - currently empty as we don't store historical snapshots yet
      engagement: [],
      followers: [],
      impressions: [],
      platforms: {
        instagram: instagramStats,
        youtube: youtubeStats,
        tiktok: tiktokStats,
        threads: threadsStats,
        facebook: facebookStats
      }
    }

    return data
  } catch (error) {
    console.error("Error in getUserStats:", error)
    return {
      overview: { totalPosts: 0, totalEngagement: 0, totalImpressions: 0, scheduledPosts: 0 },
      engagement: [],
      followers: [],
      impressions: [],
      platforms: {
        instagram: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 },
        youtube: { views: 0, videos: 0, comments: 0, likes: 0, followers: 0, engagement: 0, impressions: 0 },
        tiktok: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 },
        threads: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 },
        facebook: { engagement: 0, followers: 0, impressions: 0, growth: 0, likes: 0, comments: 0 }
      }
    }
  }
}
