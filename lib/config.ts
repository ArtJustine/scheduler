// lib/config.ts
// Configuration for all social media platform API keys

export const config = {
  // Firebase Configuration (must match lib/firebase-client.ts)
  firebase: {
    apiKey: "AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8",
    authDomain: "socialmedia-scheduler-eb22f.firebaseapp.com",
    projectId: "socialmedia-scheduler-eb22f",
    storageBucket: "socialmedia-scheduler-eb22f.firebasestorage.app",
    messagingSenderId: "974176191059",
    appId: "1:974176191059:web:4b29d837e57c00a97abca6",
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
    clientKey: process.env.TIKTOK_CLIENT_KEY || "sbaw0g0284gv7qrf7t",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "lxgui2v0OrGTIRx9UQX4LRwWmmMFMxQH",
    redirectUri: process.env.TIKTOK_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/tiktok",
  },

  // YouTube API Configuration
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "913909744920-eq12dpthfkp3ur4qahh4teuf1b69vcu0.apps.googleusercontent.com",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/youtube",
    apiKey: process.env.YOUTUBE_API_KEY || "AIzaSyAuluhWpEFVsoNYS8PCyaf4XIgvHif6cC0",
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
    scopes: ["openid", "profile", "email", "w_member_social"],
  },

  // Pinterest API Configuration
  pinterest: {
    appId: process.env.PINTEREST_APP_ID || "",
    appSecret: process.env.PINTEREST_APP_SECRET || "",
    redirectUri: process.env.PINTEREST_REDIRECT_URI || "http://localhost:3000/api/auth/callback/pinterest",
    scopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
  },

  // Threads API Configuration
  threads: {
    appId: process.env.THREADS_APP_ID || "",
    appSecret: process.env.THREADS_APP_SECRET || "",
    redirectUri: process.env.THREADS_REDIRECT_URI || "http://localhost:3000/api/auth/callback/threads",
    scopes: ["threads_basic", "threads_content_publish", "threads_manage_insights"],
  },

  // General app configuration
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://chiyusocial.com",
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
    case "pinterest":
      return !!(config.pinterest.appId && config.pinterest.appSecret);
    case "threads":
      return !!(config.threads.appId && config.threads.appSecret);
    default:
      return false;
  }
}

export default config; 