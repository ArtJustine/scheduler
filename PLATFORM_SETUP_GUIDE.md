# Platform Configuration Fix Guide

## Issues Found:
1. **YouTube**: `redirect_uri_mismatch` error
2. **TikTok**: `code_challenge` error (now fixed with PKCE implementation)

## YouTube Configuration Fix

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Click "Edit" (pencil icon)

### Step 2: Add Redirect URI
In the "Authorized redirect URIs" section, add:
```
http://localhost:3000/api/auth/callback/youtube
```

### Step 3: Add Test Users (Crucial for "Access Blocked" Error)
If your app is in "Testing" mode:
1. Go to "OAuth consent screen"
2. Scroll down to "Test users"
3. Click "ADD USERS" and add `artjustine.gonzales@gmail.com` (or the email you are testing with)
4. Click "Save" or "Add"

### Step 4: Save Changes
Click "Save" to update your OAuth client configuration.

## TikTok Configuration Fix

### Step 1: TikTok Developer Console Setup
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Log in to your developer account
3. Go to your app dashboard
4. Click on "Manage" for your app

### Step 2: Configure OAuth Settings
1. Go to "OAuth" section
2. Add this redirect URI:
```
http://localhost:3000/api/auth/callback/tiktok
```

### Step 3: Request Permissions
Make sure your app has these permissions:
- `user.info.basic`
- `video.upload`
- `video.publish`

### Step 4: Save Changes
Save your app configuration.

## Testing the Fixes

### Test YouTube:
1. Go to: `http://localhost:3000/test-oauth`
2. Click "Test YouTube Authentication"
3. You should be redirected to Google's OAuth page
4. After authorization, you'll be redirected back to the connections page

### Test TikTok:
1. Go to: `http://localhost:3000/test-oauth`
2. Click "Test TikTok Authentication"
3. You should be redirected to TikTok's OAuth page
4. After authorization, you'll be redirected back to the connections page

## Common Issues and Solutions

### YouTube Issues:
- **redirect_uri_mismatch**: Make sure the redirect URI in Google Cloud Console exactly matches `http://localhost:3000/api/auth/callback/youtube`
- **Invalid client**: Check that your client ID and secret are correct in `lib/config.ts`
- **Access Blocked (403: access_denied)**: Your app is in "Testing" mode. You MUST add your email to the "Test users" list in the Google Cloud Console (OAuth consent screen section).

### TikTok Issues:
- **code_challenge error**: This should now be fixed with the PKCE implementation
- **Invalid redirect URI**: Make sure the redirect URI in TikTok Developer Console exactly matches `http://localhost:3000/api/auth/callback/tiktok`
- **client_key error**: The `clientKey` in `lib/config.ts` does not match your TikTok App. Double-check your App Dashboard for the correct "Client Key".
- **Permission denied**: Ensure your app has the required permissions and that your account is added as a "Tester" if the app is in Staging.

## Production Deployment

When deploying to production, you'll need to:

1. **Update redirect URIs** to your production domain:
   - YouTube: `https://yourdomain.com/api/auth/callback/youtube`
   - TikTok: `https://yourdomain.com/api/auth/callback/tiktok`

2. **Update environment variables** in your hosting platform

3. **Use proper PKCE implementation** with SHA256 hashing for TikTok

## Debug Information

You can check your configuration status by visiting:
```
http://localhost:3000/api/debug/config
```

This will show you:
- Whether each platform is configured
- The current redirect URIs
- Environment variable status 