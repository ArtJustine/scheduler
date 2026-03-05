// lib/config.ts
// Configuration for all social media platform API keys

export const config = {
  // Firebase Configuration (must match lib/firebase-client.ts)
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  },

  // Instagram API Configuration (matching Meta dashboard exactly)
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || "",
    // Use the Meta App Secret that corresponds with the App ID above
    appSecret: process.env.INSTAGRAM_APP_SECRET || "",
    // Hardcode Redirect URI to ensure exact match between Auth and Callback, ignoring Vercel env
    // NO trailing slash - must match Meta App Dashboard configuration exactly
    redirectUri: "https://chiyusocial.com/api/auth/callback/instagram",
    apiVersion: "18.0",
    scopes: [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "pages_show_list",
      "pages_read_engagement",
      "public_profile",
      "email"
    ],
  },

  // TikTok API Configuration
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    redirectUri: process.env.TIKTOK_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/tiktok",
  },

  // YouTube API Configuration
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/youtube",
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
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/facebook",
    apiVersion: "18.0",
    scopes: [
      "instagram_basic",
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "public_profile"
    ],
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
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/linkedin",
    scopes: ["openid", "profile", "email", "w_member_social"],
  },

  // Pinterest API Configuration
  pinterest: {
    appId: process.env.PINTEREST_APP_ID || "",
    appSecret: process.env.PINTEREST_APP_SECRET || "",
    redirectUri: process.env.PINTEREST_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/pinterest",
    scopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
  },

  // Threads API Configuration
  threads: {
    appId: process.env.THREADS_APP_ID || "",
    appSecret: process.env.THREADS_APP_SECRET || "",
    redirectUri: process.env.THREADS_REDIRECT_URI || "https://chiyusocial.com/api/auth/callback/threads",
    scopes: ["threads_basic", "threads_content_publish", "threads_manage_insights"],
  },

  // Bluesky API Configuration
  bluesky: {
    // Note: Bluesky currently uses App Passwords for most simple integrations
    identifier: process.env.BLUESKY_IDENTIFIER || "",
    appPassword: process.env.BLUESKY_APP_PASSWORD || "",
    service: process.env.BLUESKY_SERVICE || "https://bsky.social",
  },

  // General app configuration
  app: {
    baseUrl:
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : `https://${process.env.VERCEL_URL}`) ||
      "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
    cronSecret: process.env.CRON_SECRET || "",
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
    case "bluesky":
      return !!(config.bluesky.identifier && config.bluesky.appPassword);
    default:
      return false;
  }
}

export default config; 
