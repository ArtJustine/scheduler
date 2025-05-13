# Social Media Scheduler

A comprehensive social media scheduling tool that allows users to connect their Instagram, YouTube, and TikTok accounts and schedule posts across these platforms.

## Features

- Connect multiple social media accounts (Instagram, YouTube, TikTok)
- Schedule posts for future publication
- View analytics and insights for connected accounts
- Manage media library and content
- Dark mode support
- Responsive design for all devices

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- Firebase account
- Developer accounts for Instagram, YouTube, and TikTok

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id

# Instagram/Facebook Configuration
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# Google/YouTube Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# TikTok Configuration
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Application Configuration
NEXT_PUBLIC_URL=https://your-app-url.com

# Cron Job Configuration
CRON_SECRET=your-cron-secret
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Setting Up Social Media APIs

#### Instagram

1. Create a Facebook Developer account
2. Create a new app in the Facebook Developer Console
3. Add the Instagram Basic Display API
4. Configure the OAuth redirect URI: `https://your-app-url.com/api/auth/callback/instagram`
5. Add the required permissions: `user_profile`, `user_media`
6. Copy the Client ID and Client Secret to your `.env.local` file

#### YouTube

1. Create a Google Developer account
2. Create a new project in the Google Developer Console
3. Enable the YouTube Data API v3
4. Configure the OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add the authorized redirect URI: `https://your-app-url.com/api/auth/callback/youtube`
7. Copy the Client ID and Client Secret to your `.env.local` file

#### TikTok

1. Create a TikTok Developer account
2. Create a new app in the TikTok Developer Console
3. Configure the OAuth redirect URI: `https://your-app-url.com/api/auth/callback/tiktok`
4. Add the required permissions: `user.info.basic`, `video.list`
5. Copy the Client Key and Client Secret to your `.env.local` file

### Setting Up the Scheduler

To enable automatic publishing of scheduled posts, you need to set up a cron job to call the scheduler API endpoint:

1. Create a cron job that calls `https://your-app-url.com/api/cron/scheduler` every minute
2. Add the Authorization header: `Authorization: Bearer your-cron-secret`

You can use services like Vercel Cron Jobs, AWS Lambda, or any other cron job service.

## Deployment

The easiest way to deploy this application is using Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
