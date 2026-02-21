# Setting Up the Scheduler and Fixing Auth Redirects

This guide explains how to ensure your scheduled posts actually get published and how to fix the Google Auth error.

## 1. Fixing the "Authorized Redirect URI" Error

Your Google Cloud Console screenshot shows that the correct Redirect URI is missing. This will key for logging in and refreshing tokens.

**You must add the exact callback URL for your app.**

1.  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Click on your **"Web client"** ID.
3.  Scroll to **"Authorized redirect URIs"**.
4.  Add the following URIs:
    *   **For Local Development:** `http://localhost:3000/api/auth/callback/youtube`
    *   **For Production:** `https://chiyusocial.com/api/auth/callback/youtube`
        *   *(Also add any `www` version if you plan to use it)*
5.  Click **Save**.

> **Note:** Just having `.../auth/handle` is for Firebase Auth (login). The `.../api/auth/callback/youtube` is for the YouTube API permission grant.

## 2. Why "Scheduled" Posts Weren't Posting

Your posts were stuck in "Scheduled" because there is no automatic background process running on your local computer to check for due posts.

**Dashboard Status Change:**
I have updated the Calendar view. If a post is past its due date but still "Scheduled", it will now show as **"Pending"** or **"Missed"** instead of falsely saying "Posted".

## 3. How to Run the Scheduler

### Option A: Manual Trigger (For Testing)

You can manually trigger the check by visiting this URL in your browser:

`http://localhost:3000/api/cron/scheduler?secret=development`

(Or `https://your-site.vercel.app/api/cron/scheduler?secret=development` if deployed)

When you visit this page, it will:
1.  Check for all posts with status "scheduled" and time <= now.
2.  Attempt to publish them.
3.  Update their status to "published" or "failed".

### Option B: Vercel Cron (Pro Plan)

If you are on the Vercel Pro plan, you can use the built-in cron jobs:

1.  In your project root, check `vercel.json`:
    ```json
    {
      "crons": [
        {
          "path": "/api/cron/scheduler?secret=YOUR_SECURE_SECRET",
          "schedule": "*/10 * * * *"
        }
      ]
    }
    ```
2.  **Important:** You need to set the `CRON_SECRET` environment variable in Vercel to match the secret you use in the URL.

### Option C: Cron-job.org (Recommended for Hobby Plan)

Since Vercel Hobby plan has strict limits on cron jobs, we recommend using **[cron-job.org](https://cron-job.org)** for free, frequent scheduling.

1.  Go to **Dashboard > Settings > Scheduler** in the app.
2.  Copy your unique **Scheduler Webhook URL**.
3.  Create a free account at [cron-job.org](https://cron-job.org).
4.  Create a new cron job, paste your URL, and set it to run every **1 minute**.
5.  This ensures your posts are published exactly when they are scheduled.

## 4. Immediate Next Steps

1.  **Fix the Redirect URI** in Google Cloud Console.
2.  **Re-connect YouTube** in your app settings (to get a fresh, working token).
3.  **Run the Scheduler Manually** (visit the link in Option A) to push your stuck post.
