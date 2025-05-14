// Mock data for the social media scheduler app
import type { PostType } from "@/types/post"
import type { SocialAccounts } from "@/types/social"
import type { MediaItem } from "@/types/media"
import type { HashtagGroup } from "@/types/hashtag"
import type { CaptionTemplate } from "@/types/caption"

// Helper function to generate dates
const daysFromNow = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// Mock social accounts data
export const MOCK_ACCOUNTS: SocialAccounts = {
  instagram: {
    username: "demo_instagram",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 1250,
    followersGrowth: 5.2,
    engagement: 3.8,
    impressions: 4500,
    posts: 42,
    updatedAt: new Date().toISOString(),
  },
  youtube: {
    username: "demo_youtube",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 3800,
    followersGrowth: 2.7,
    engagement: 4.5,
    impressions: 12000,
    posts: 28,
    updatedAt: new Date().toISOString(),
  },
  tiktok: {
    username: "demo_tiktok",
    accessToken: "mock_token",
    connected: true,
    connectedAt: new Date().toISOString(),
    followers: 5600,
    followersGrowth: 8.3,
    engagement: 6.2,
    impressions: 25000,
    posts: 35,
    updatedAt: new Date().toISOString(),
  },
}

// Mock posts data
export const MOCK_POSTS: PostType[] = [
  {
    id: "mock-post-1",
    title: "Summer Collection Launch",
    content: "Check out our new summer collection! #summer #fashion",
    platform: "instagram",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(1), // Tomorrow
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-2",
    title: "Product Tutorial",
    content: "Learn how to use our new product in this quick tutorial!",
    platform: "youtube",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(2), // Day after tomorrow
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-3",
    title: "Behind the Scenes",
    content: "Take a look behind the scenes of our latest photoshoot! #bts",
    platform: "tiktok",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(3), // 3 days from now
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-4",
    title: "New Product Announcement",
    content: "Exciting news! We're launching a new product next week. Stay tuned! #newproduct #launch",
    platform: "instagram",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(4),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-5",
    title: "Customer Testimonial",
    content: "Hear what our customers have to say about our services!",
    platform: "youtube",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(5),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-6",
    title: "Quick Tip Tuesday",
    content: "Here's a quick tip to improve your productivity! #productivity #tips",
    platform: "tiktok",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(6),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-post-7",
    title: "Weekend Sale",
    content: "Don't miss our weekend sale! 20% off everything. #sale #discount",
    platform: "instagram",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: daysFromNow(7),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock published posts
export const MOCK_PUBLISHED_POSTS: PostType[] = [
  {
    id: "pub-post-1",
    title: "Spring Collection",
    content: "Our spring collection is now available! #spring #fashion",
    platform: "instagram",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    publishedAt: daysFromNow(-5), // 5 days ago
    status: "published",
    createdAt: daysFromNow(-6),
    updatedAt: daysFromNow(-5),
    analytics: {
      likes: 245,
      comments: 37,
      shares: 18,
      impressions: 1200,
      engagement: 4.2,
    },
  },
  {
    id: "pub-post-2",
    title: "How-To Guide",
    content: "Check out our comprehensive how-to guide!",
    platform: "youtube",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    publishedAt: daysFromNow(-10), // 10 days ago
    status: "published",
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-10),
    analytics: {
      likes: 156,
      comments: 24,
      shares: 12,
      impressions: 890,
      engagement: 3.8,
    },
  },
  {
    id: "pub-post-3",
    title: "Trending Challenge",
    content: "We're taking part in the trending challenge! #challenge",
    platform: "tiktok",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    publishedAt: daysFromNow(-15), // 15 days ago
    status: "published",
    createdAt: daysFromNow(-16),
    updatedAt: daysFromNow(-15),
    analytics: {
      likes: 1245,
      comments: 87,
      shares: 356,
      impressions: 15000,
      engagement: 7.8,
    },
  },
]

// Mock media library items
export const MOCK_MEDIA: MediaItem[] = [
  {
    id: "media-1",
    title: "Product Image 1",
    type: "image",
    url: "/placeholder.svg?height=400&width=400",
    fileName: "product1.jpg",
    fileSize: 1024 * 1024 * 2, // 2MB
    createdAt: daysFromNow(-20),
  },
  {
    id: "media-2",
    title: "Product Video",
    type: "video",
    url: "/placeholder.svg?height=400&width=400",
    fileName: "product_video.mp4",
    fileSize: 1024 * 1024 * 15, // 15MB
    createdAt: daysFromNow(-15),
  },
  {
    id: "media-3",
    title: "Team Photo",
    type: "image",
    url: "/placeholder.svg?height=400&width=400",
    fileName: "team.jpg",
    fileSize: 1024 * 1024 * 3, // 3MB
    createdAt: daysFromNow(-10),
  },
  {
    id: "media-4",
    title: "Office Tour",
    type: "video",
    url: "/placeholder.svg?height=400&width=400",
    fileName: "office_tour.mp4",
    fileSize: 1024 * 1024 * 25, // 25MB
    createdAt: daysFromNow(-5),
  },
]

// Mock hashtag groups
export const MOCK_HASHTAG_GROUPS: HashtagGroup[] = [
  {
    id: "hashtag-1",
    name: "Fashion",
    hashtags: ["#fashion", "#style", "#clothing", "#accessories", "#trendy", "#outfit"],
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-5),
  },
  {
    id: "hashtag-2",
    name: "Food",
    hashtags: ["#food", "#foodie", "#delicious", "#yummy", "#instafood", "#foodphotography"],
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-25),
  },
  {
    id: "hashtag-3",
    name: "Travel",
    hashtags: ["#travel", "#adventure", "#wanderlust", "#explore", "#traveling", "#vacation"],
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-10),
  },
]

// Mock caption templates
export const MOCK_CAPTION_TEMPLATES: CaptionTemplate[] = [
  {
    id: "caption-1",
    title: "Product Launch",
    content: "Exciting news! We've just launched our new [PRODUCT]. Check it out now! #newlaunch #exciting",
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-15),
  },
  {
    id: "caption-2",
    title: "Sale Announcement",
    content: "SALE ALERT! Get [DISCOUNT]% off all products until [DATE]. Don't miss out! #sale #discount",
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-10),
  },
  {
    id: "caption-3",
    title: "Motivational Monday",
    content:
      "It's Monday! Time to set your goals for the week and crush them. What are you working on this week? #MondayMotivation #Goals",
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-5),
  },
]

// Mock analytics data
export const MOCK_ANALYTICS = {
  overview: {
    totalPosts: 75,
    scheduledPosts: 7,
    publishedPosts: 68,
    totalEngagement: 5.4,
    totalImpressions: 45000,
  },
  platforms: {
    instagram: {
      followers: 1250,
      followersGrowth: 5.2,
      engagement: 3.8,
      impressions: 4500,
      posts: 42,
    },
    youtube: {
      followers: 3800,
      followersGrowth: 2.7,
      engagement: 4.5,
      impressions: 12000,
      posts: 28,
    },
    tiktok: {
      followers: 5600,
      followersGrowth: 8.3,
      engagement: 6.2,
      impressions: 25000,
      posts: 35,
    },
  },
  engagement: [
    { date: "2023-01-01", instagram: 3.2, youtube: 4.1, tiktok: 5.8 },
    { date: "2023-02-01", instagram: 3.5, youtube: 4.3, tiktok: 6.0 },
    { date: "2023-03-01", instagram: 3.7, youtube: 4.4, tiktok: 6.2 },
    { date: "2023-04-01", instagram: 3.8, youtube: 4.5, tiktok: 6.3 },
    { date: "2023-05-01", instagram: 3.9, youtube: 4.6, tiktok: 6.5 },
    { date: "2023-06-01", instagram: 4.0, youtube: 4.7, tiktok: 6.8 },
  ],
  followers: [
    { date: "2023-01-01", instagram: 1000, youtube: 3500, tiktok: 5000 },
    { date: "2023-02-01", instagram: 1050, youtube: 3600, tiktok: 5200 },
    { date: "2023-03-01", instagram: 1100, youtube: 3650, tiktok: 5300 },
    { date: "2023-04-01", instagram: 1150, youtube: 3700, tiktok: 5400 },
    { date: "2023-05-01", instagram: 1200, youtube: 3750, tiktok: 5500 },
    { date: "2023-06-01", instagram: 1250, youtube: 3800, tiktok: 5600 },
  ],
  impressions: [
    { date: "2023-01-01", instagram: 3500, youtube: 10000, tiktok: 22000 },
    { date: "2023-02-01", instagram: 3700, youtube: 10500, tiktok: 22500 },
    { date: "2023-03-01", instagram: 3900, youtube: 11000, tiktok: 23000 },
    { date: "2023-04-01", instagram: 4100, youtube: 11500, tiktok: 23500 },
    { date: "2023-05-01", instagram: 4300, youtube: 11800, tiktok: 24000 },
    { date: "2023-06-01", instagram: 4500, youtube: 12000, tiktok: 25000 },
  ],
}

// Mock user data
export const MOCK_USER = {
  uid: "mock-user-id",
  email: "demo@example.com",
  displayName: "Demo User",
  photoURL: "/placeholder.svg?height=40&width=40",
  createdAt: daysFromNow(-60),
}
