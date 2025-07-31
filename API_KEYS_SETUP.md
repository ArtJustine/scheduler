# Social Media API Keys Setup Guide

This guide will help you set up API keys for all the social media platforms supported by your scheduler application.

## Files You Need to Update

### 1. Environment Variables (.env.local)
Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=socialmedia-scheduler-eb22f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=socialmedia-scheduler-eb22f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=socialmedia-scheduler-eb22f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=974176191059
NEXT_PUBLIC_FIREBASE_APP_ID=1:974176191059:web:4b29d837e57c00a97abca6

# Instagram API Configuration
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/callback/instagram

# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/callback/tiktok

# YouTube API Configuration
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/callback/youtube
YOUTUBE_API_KEY=your_youtube_api_key

# Facebook API Configuration (for Instagram Business)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/callback/facebook

# Twitter/X API Configuration
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/callback/twitter

# LinkedIn API Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/callback/linkedin
```

### 2. Configuration File (lib/config.ts)
✅ **Already created** - This file manages all your API configurations.

### 3. API Route Files to Update
You'll need to update these files to implement actual OAuth flows:

- `app/api/auth/instagram/route.ts`
- `app/api/auth/tiktok/route.ts`
- `app/api/auth/youtube/route.ts`
- `app/api/auth/facebook/route.ts`
- `app/api/auth/twitter/route.ts`
- `app/api/auth/linkedin/route.ts`

## Where to Get API Keys

### 1. Instagram API
**URL:** https://developers.facebook.com/apps/
**Steps:**
1. Go to Facebook Developers
2. Create a new app or use existing app
3. Add Instagram Basic Display or Instagram Graph API product
4. Get App ID and App Secret
5. Configure OAuth redirect URIs
6. Submit for app review (required for publishing)

**Required Permissions:**
- `instagram_basic` - Read profile info and media
- `instagram_content_publish` - Publish content
- `pages_show_list` - Access connected Facebook pages
- `pages_read_engagement` - Read page insights

### 2. TikTok API
**URL:** https://developers.tiktok.com/
**Steps:**
1. Create TikTok for Developers account
2. Create a new app
3. Get Client Key and Client Secret
4. Configure OAuth redirect URIs
5. Apply for permissions (video.upload, video.publish)

**Required Permissions:**
- `video.upload` - Upload videos
- `video.publish` - Publish videos
- `user.info.basic` - Read user info

### 3. YouTube API
**URL:** https://console.cloud.google.com/
**Steps:**
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Get Client ID and Client Secret
6. Create API Key for additional features

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.readonly`

### 4. Facebook API (for Instagram Business)
**URL:** https://developers.facebook.com/apps/
**Steps:**
1. Same as Instagram (Facebook owns Instagram)
2. Add Facebook Login product
3. Configure OAuth settings
4. Get App ID and App Secret

### 5. Twitter/X API
**URL:** https://developer.twitter.com/
**Steps:**
1. Apply for Twitter Developer account
2. Create a new app
3. Get API Key, API Secret, Bearer Token
4. Create OAuth 2.0 credentials
5. Get Client ID and Client Secret

**Required Permissions:**
- `tweet.read` - Read tweets
- `tweet.write` - Post tweets
- `users.read` - Read user info
- `offline.access` - Refresh tokens

### 6. LinkedIn API
**URL:** https://www.linkedin.com/developers/
**Steps:**
1. Go to LinkedIn Developers
2. Create a new app
3. Get Client ID and Client Secret
4. Configure OAuth redirect URIs
5. Request necessary permissions

**Required Permissions:**
- `r_liteprofile` - Read basic profile
- `w_member_social` - Post content

## Additional Dependencies to Install

You'll need to install these packages for OAuth implementation:

```bash
pnpm add @types/node
pnpm add oauth-1.0a
pnpm add axios
pnpm add jsonwebtoken
pnpm add @types/jsonwebtoken
```

## Security Best Practices

1. **Never commit API keys to version control**
   - Add `.env.local` to your `.gitignore`
   - Use environment variables in production

2. **Use different keys for development and production**
   - Create separate apps for each environment
   - Use different redirect URIs

3. **Implement proper token storage**
   - Store refresh tokens securely
   - Implement token refresh logic
   - Use secure session management

4. **Rate limiting**
   - Implement rate limiting for API calls
   - Respect platform-specific limits

## Next Steps

1. Create the `.env.local` file with your API keys
2. Install the required dependencies
3. Update the API route files to implement OAuth flows
4. Test each platform's authentication
5. Implement posting functionality for each platform

## Production Deployment

For production deployment, you'll need to:

1. Update redirect URIs to your production domain
2. Set up environment variables in your hosting platform
3. Configure CORS settings
4. Set up proper SSL certificates
5. Implement proper error handling and logging

## Troubleshooting

- **CORS errors:** Ensure redirect URIs are properly configured
- **Invalid redirect URI:** Check that URIs match exactly (including protocol)
- **Permission denied:** Ensure you've requested the correct permissions
- **Rate limiting:** Implement proper rate limiting and retry logic 