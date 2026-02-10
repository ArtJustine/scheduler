# Debugging YouTube Posting Issues

If your dashboard shows "Posted" but the video is not on YouTube, follow these steps to investigate.

## 1. Verify Post Status in Firebase (Database)

Since the dashboard says "Posted", the database record state is `published`. However, we need to check the detailed platform response.

1.  Go to your **Firebase Console** -> **Firestore Database**.
2.  Open the `posts` collection.
3.  Find the document with the ID of your post (you can find this in the URL when viewing the post in your app, e.g., `/dashboard/post/[id]`).
4.  Look for the `platformResults` field.
    *   It should look something like:
        ```json
        platformResults: {
          youtube: {
            success: true,
            platformId: "VIDEO_ID_HERE"
          }
        }
        ```
    *   **If `platformId` is missing or undefined:** The posting failed silently (this was a bug I just patched).
    *   **If `platformId` is present:** Copy this ID. Go to `https://www.youtube.com/watch?v=VIDEO_ID_HERE`.
        *   If the video exists but says "Processing": Wait a few minutes.
        *   If the video exists but says "Private": Check your default privacy settings (code sets it to "public").
        *   If the video says "Unavailable": It might have been deleted or the upload failed after the ID was generated.

## 2. Check the Correct YouTube Channel

It is common to authorize one channel but check another (e.g., Brand Account vs. Personal Account).

1.  Go to YouTube.
2.  Click your profile icon in the top right.
3.  Select **"Switch account"**.
4.  Check all listed channels to see if the video appeared on a different one.

## 3. Review Server Logs (If accessible)

If you are running the app locally or have access to Vercel logs:

1.  Look for logs starting with `Successfully published post...`.
2.  If my recent fix caught an error, you will now see `Error publishing post [id]: YouTube API returned 401...` or `YouTube API call succeeded but returned no video ID`.

## 4. Google Cloud Console Quotas

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project.
3.  Go to **APIs & Services** -> **Enabled APIs & Services**.
4.  Click **YouTube Data API v3**.
5.  Check the **Quotas** tab. If you exceeded the daily upload quota (usually quite high, but worth checking), the API returns errors.

## 5. Re-authenticate

Token issues are the most common cause of "silent" failures (where the app thinks it has permission but doesn't).

1.  Go to your app's **Settings** or **Integrations** page.
2.  **Disconnect** YouTube.
3.  **Reconnect** YouTube, ensuring you grant **all** requested permissions (especially "Manage your YouTube videos").

## Summary of Fixes Applied

I have patched `lib/scheduler-service.ts` to prevent false "Success" messages. Previously, if the authentication token expired and the refresh failed, the system might have incorrectly reported the post as "Posted".
