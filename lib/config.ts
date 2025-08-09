// lib/config.ts
// Configuration for all social media platform API keys

export const config = {
  // Firebase Configuration (must be provided via env in production)
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  },

  // Instagram API Configuration
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || "",
    appSecret: process.env.INSTAGRAM_APP_SECRET || "",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/auth/callback/instagram",
    apiVersion: "v18.0",
  },

  // TikTok API Configuration
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    redirectUri: process.env.TIKTOK_REDIRECT_URI || "",
  },

  // YouTube API Configuration
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || "",
    apiKey: process.env.YOUTUBE_API_KEY || "",
    scopes: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.readonly"
    ],
  },

  // Facebook API Configuration (for Instagram Business)
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3000/api/auth/callback/facebook",
    apiVersion: "v18.0",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"],
  },

  // Twitter/X API Configuration
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || "",
    apiSecret: process.env.TWITTER_API_SECRET || "",
    bearerToken: process.env.TWITTER_BEARER_TOKEN || "",
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    redirectUri: process.env.TWITTER_REDIRECT_URI || "http://localhost:3000/api/auth/callback/twitter",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },

  // LinkedIn API Configuration
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/callback/linkedin",
    scopes: ["r_liteprofile", "w_member_social"],
  },

  // General app configuration
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
    environment: process.env.NODE_ENV || "development",
  },
}

// Helper function to check if a platform is configured
export const isPlatformConfigured = (platform: string): boolean => {
  switch (platform) {
    case "instagram":
      return !!(config.instagram.appId && config.instagram.appSecret);
    case "tiktok":
      return !!(config.tiktok.clientKey && config.tiktok.clientSecret);
    case "youtube":
      return !!(config.youtube.clientId && config.youtube.clientSecret);
    case "facebook":
      return !!(config.facebook.appId && config.facebook.appSecret);
    case "twitter":
      return !!(config.twitter.clientId && config.twitter.clientSecret);
    case "linkedin":
      return !!(config.linkedin.clientId && config.linkedin.clientSecret);
    default:
      return false;
  }
}

export default config; 