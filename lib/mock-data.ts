import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"

// Helper function to generate dates
const getDate = (daysFromNow: number) => {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()
}

// Helper function to generate IDs
const generateId = () => uuidv4()

// Mock user data
export const MOCK_USER = {
  uid: "user-1",
  name: "Demo User",
  email: "demo@example.com",
  photoURL: "/placeholder.svg?height=40&width=40",
}

// Mock social accounts
export const mockSocialAccounts = {
  instagram: {
    id: "instagram-1",
    username: "demo_instagram",
    followers: 12500,
    following: 850,
    engagement: 3.8,
    impressions: 45000,
    connected: true,
    profileImage: "/placeholder.svg?height=40&width=40",
  },
  youtube: {
    id: "youtube-1",
    username: "DemoYouTubeChannel",
    followers: 38000,
    following: 120,
    engagement: 4.5,
    impressions: 120000,
    connected: true,
    profileImage: "/placeholder.svg?height=40&width=40",
  },
  tiktok: {
    id: "tiktok-1",
    username: "demo_tiktok",
    followers: 56000,
    following: 1200,
    engagement: 6.2,
    impressions: 250000,
    connected: true,
    profileImage: "/placeholder.svg?height=40&width=40",
  },
}

// Mock posts
export const mockPosts = [
  {
    id: "post-1",
    userId: "user-1",
    title: "Product Launch",
    description: "Check out our new product launch! #newproduct #launch",
    platform: "instagram",
    contentType: "image",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: getDate(2),
    status: "scheduled",
    createdAt: getDate(-1),
    updatedAt: getDate(-1),
  },
  {
    id: "post-2",
    userId: "user-1",
    title: "Photoshoot BTS",
    description: "Behind the scenes at our latest photoshoot! #bts #photoshoot",
    platform: "instagram",
    contentType: "image",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: getDate(5),
    status: "scheduled",
    createdAt: getDate(-2),
    updatedAt: getDate(-2),
  },
  {
    id: "post-3",
    userId: "user-1",
    title: "YouTube Tutorial",
    description: "New tutorial video is up! Check it out on our YouTube channel. #tutorial #howto",
    platform: "youtube",
    contentType: "video",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: getDate(1),
    status: "scheduled",
    createdAt: getDate(-3),
    updatedAt: getDate(-3),
  },
  {
    id: "post-4",
    userId: "user-1",
    title: "TikTok Challenge",
    description: "TikTok challenge time! Show us your best moves. #challenge #dance",
    platform: "tiktok",
    contentType: "video",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: getDate(3),
    status: "scheduled",
    createdAt: getDate(-4),
    updatedAt: getDate(-4),
  },
  {
    id: "post-5",
    userId: "user-1",
    title: "50K Followers!",
    description: "Thank you for 50K followers! #milestone #thankyou",
    platform: "instagram",
    contentType: "image",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    scheduledFor: getDate(-1),
    status: "published",
    createdAt: getDate(-5),
    updatedAt: getDate(-1),
  },
]

// Mock media library
export const mockMedia = [
  {
    id: "media-1",
    url: "/placeholder.svg?height=400&width=400",
    type: "image",
    createdAt: getDate(-1),
  },
  {
    id: "media-2",
    url: "/placeholder.svg?height=400&width=400",
    type: "image",
    createdAt: getDate(-2),
  },
  {
    id: "media-3",
    url: "/placeholder.svg?height=400&width=400",
    type: "image",
    createdAt: getDate(-3),
  },
  {
    id: "media-4",
    url: "/placeholder.svg?height=400&width=400",
    type: "image",
    createdAt: getDate(-4),
  },
  {
    id: "media-5",
    url: "/placeholder.svg?height=400&width=400",
    type: "image",
    createdAt: getDate(-5),
  },
]

// Mock hashtags
export const mockHashtags = [
  {
    id: "hashtag-1",
    name: "newproduct",
    count: 15,
    createdAt: getDate(-10),
  },
  {
    id: "hashtag-2",
    name: "launch",
    count: 12,
    createdAt: getDate(-11),
  },
  {
    id: "hashtag-3",
    name: "bts",
    count: 8,
    createdAt: getDate(-12),
  },
  {
    id: "hashtag-4",
    name: "photoshoot",
    count: 10,
    createdAt: getDate(-13),
  },
  {
    id: "hashtag-5",
    name: "tutorial",
    count: 5,
    createdAt: getDate(-14),
  },
]

// Mock captions
export const mockCaptions = [
  {
    id: "caption-1",
    text: "Check out our new product launch! #newproduct #launch",
    createdAt: getDate(-10),
  },
  {
    id: "caption-2",
    text: "Behind the scenes at our latest photoshoot! #bts #photoshoot",
    createdAt: getDate(-11),
  },
  {
    id: "caption-3",
    text: "New tutorial video is up! Check it out on our YouTube channel. #tutorial #howto",
    createdAt: getDate(-12),
  },
  {
    id: "caption-4",
    text: "TikTok challenge time! Show us your best moves. #challenge #dance",
    createdAt: getDate(-13),
  },
  {
    id: "caption-5",
    text: "Thank you for 50K followers! #milestone #thankyou",
    createdAt: getDate(-14),
  },
]

// Generate dates for the last 6 months
const getLast6Months = () => {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    months.push(format(date, "MMM"))
  }
  return months
}

const months = getLast6Months()

// Mock analytics data
export const mockAnalytics = {
  overview: {
    totalPosts: 125,
    totalEngagement: 4.8,
    totalImpressions: 415000,
    scheduledPosts: 12,
  },
  engagement: [
    { date: months[0], instagram: 3.2, youtube: 2.1, tiktok: 5.8 },
    { date: months[1], instagram: 3.5, youtube: 2.3, tiktok: 6.2 },
    { date: months[2], instagram: 3.8, youtube: 2.5, tiktok: 6.5 },
    { date: months[3], instagram: 3.6, youtube: 2.7, tiktok: 6.8 },
    { date: months[4], instagram: 3.9, youtube: 3.0, tiktok: 7.2 },
    { date: months[5], instagram: 4.1, youtube: 3.2, tiktok: 7.5 },
  ],
  followers: [
    { date: months[0], instagram: 10000, youtube: 30000, tiktok: 45000 },
    { date: months[1], instagram: 10500, youtube: 32000, tiktok: 48000 },
    { date: months[2], instagram: 11200, youtube: 34000, tiktok: 50000 },
    { date: months[3], instagram: 11800, youtube: 35500, tiktok: 52000 },
    { date: months[4], instagram: 12200, youtube: 37000, tiktok: 54000 },
    { date: months[5], instagram: 12500, youtube: 38000, tiktok: 56000 },
  ],
  impressions: [
    { date: months[0], instagram: 30000, youtube: 90000, tiktok: 180000 },
    { date: months[1], instagram: 32000, youtube: 95000, tiktok: 195000 },
    { date: months[2], instagram: 35000, youtube: 100000, tiktok: 210000 },
    { date: months[3], instagram: 38000, youtube: 105000, tiktok: 225000 },
    { date: months[4], instagram: 42000, youtube: 110000, tiktok: 240000 },
    { date: months[5], instagram: 45000, youtube: 120000, tiktok: 250000 },
  ],
  platforms: {
    instagram: {
      likes: 8500,
      comments: 1200,
      shares: 950,
      saves: 750,
    },
    youtube: {
      likes: 15000,
      comments: 2800,
      shares: 1500,
      saves: 0,
    },
    tiktok: {
      likes: 45000,
      comments: 3500,
      shares: 12000,
      saves: 8000,
    },
  },
}

// Mock data service functions
export const mockDataService = {
  // User functions
  getCurrentUser: () => Promise.resolve(MOCK_USER),
  login: () => Promise.resolve(MOCK_USER),
  signup: () => Promise.resolve(MOCK_USER),
  logout: () => Promise.resolve(),

  // Social account functions
  getSocialAccounts: () => Promise.resolve(mockSocialAccounts),
  connectSocialAccount: () => Promise.resolve(true),
  disconnectSocialAccount: () => Promise.resolve(true),

  // Post functions
  getPosts: () => Promise.resolve(mockPosts),
  getPost: (id: string) => Promise.resolve(mockPosts.find((post) => post.id === id) || null),
  createPost: () => Promise.resolve({ id: generateId() }),
  updatePost: () => Promise.resolve(true),
  deletePost: () => Promise.resolve(true),
  schedulePost: () => Promise.resolve(true),

  // Media functions
  getMedia: () => Promise.resolve(mockMedia),
  uploadMedia: () => Promise.resolve({ id: generateId(), url: "/placeholder.svg?height=400&width=400" }),
  deleteMedia: () => Promise.resolve(true),

  // Hashtag functions
  getHashtags: () => Promise.resolve(mockHashtags),
  createHashtag: () => Promise.resolve({ id: generateId() }),
  deleteHashtag: () => Promise.resolve(true),

  // Caption functions
  getCaptions: () => Promise.resolve(mockCaptions),
  createCaption: () => Promise.resolve({ id: generateId() }),
  deleteCaption: () => Promise.resolve(true),

  // Analytics functions
  getAnalytics: () => Promise.resolve(mockAnalytics),
}
