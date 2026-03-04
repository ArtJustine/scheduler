# Production Setup Guide: Fixing Firebase & Authentication

The issues you've reported (missing blog articles and non-functional login/signup) are caused by missing or incorrectly configured Firebase environment variables in your production environment.

## Root Cause
The application uses `NEXT_PUBLIC_` prefixed environment variables to initialize the Firebase SDK on the client side. These variables are missing in your live site's configuration (e.g., Vercel), which prevents the application from connecting to the database and authentication services.

## The Fix

### 1. Add Environment Variables to Vercel
You need to add the following variables to your Vercel project settings:

| Variable Name | Value (from your `.env.local`) |
|---------------|--------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `socialmedia-scheduler-eb22f.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `socialmedia-scheduler-eb22f` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `socialmedia-scheduler-eb22f.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `974176191059` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:974176191059:web:4b29d837e57c00a97abca6` |

**Steps to add in Vercel:**
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the project: `scheduler-silk-tau` (or your current project).
3. Go to **Settings** → **Environment Variables**.
4. Add each of the variables above.
5. **Redeploy** the application for the changes to take effect on the client side.

### 2. Verify Blog Posts
Once the connection is established, if the blog still shows "No articles found", it means you need to create them in your Firestore. You can do this via the Admin Dashboard at `/admin`.

## What I've Fixed in the Code
1.  **Consolidated Firebase Logic**: I've merged redundant Firebase initialization files into a single source of truth (`lib/firebase-client.ts`).
2.  **Improved Error Messaging**: 
    - The blog page now shows a specific message if the database connection fails.
    - Console warnings are now more explicit about which variable is missing.
3.  **Consistency**: All client-side services now use the centralized configuration in `lib/config.ts`.
