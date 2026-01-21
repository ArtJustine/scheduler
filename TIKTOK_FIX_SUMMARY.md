# TikTok OAuth Integration - Critical Fixes Applied

## Root Causes of "client_key" Error

### 1. **PKCE Was Being Used (Incorrectly)**
- **Problem**: We were implementing PKCE (Proof Key for Code Exchange) with `code_challenge` and `code_verifier`
- **Why it's wrong**: TikTok Login Kit for **Web** does NOT require or support PKCE
- **Who needs PKCE**: Only TikTok Login Kit for **Desktop** applications require PKCE
- **Fix Applied**: Removed all PKCE-related code from the web OAuth flow

### 2. **Localhost Redirect URI**
- **Problem**: Using `http://localhost:3000` as redirect URI
- **Why it's wrong**: TikTok OAuth requires HTTPS URLs and does not accept localhost
- **Fix Applied**: Changed to production Vercel URL: `https://scheduler-silk-tau.vercel.app/api/auth/callback/tiktok`

## Changes Made

### Code Changes (Already Pushed to GitHub)
1. ✅ Removed `code_challenge` and `code_challenge_method` from authorization URL
2. ✅ Removed `code_verifier` generation and storage
3. ✅ Made `code_verifier` optional in token exchange function
4. ✅ Removed code verifier validation in callback
5. ✅ Updated redirect URI to production URL
6. ✅ Removed `client_id` duplicate parameter (only `client_key` is needed)

### Files Modified
- `lib/oauth-utils.ts` - Simplified TikTok OAuth (no PKCE)
- `app/api/auth/tiktok/route.ts` - Removed code verifier generation
- `app/api/auth/callback/tiktok/route.ts` - Removed code verifier validation
- `.env.local` - Updated redirect URI to production

## What You Need to Do Now

### 1. Update TikTok Developer Portal
Go to: https://developers.tiktok.com/

**In your Sandbox configuration:**
- Navigate to Login Kit product settings
- Under "Redirect URIs", ensure you have:
  ```
  https://scheduler-silk-tau.vercel.app/api/auth/callback/tiktok
  ```
- **Important**: The URL must match EXACTLY (no trailing slash, must be HTTPS)
- Save the changes

### 2. Add Environment Variables to Vercel
Go to: https://vercel.com/dashboard

**Steps:**
1. Select your project: `scheduler-silk-tau`
2. Go to **Settings** → **Environment Variables**
3. Add these three variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `TIKTOK_CLIENT_KEY` | `sbaw0g0284gv7qrf7t` | Production, Preview, Development |
| `TIKTOK_CLIENT_SECRET` | `lxgui2v0OrGTIRx9UQX4LRwWmmMFMxQH` | Production, Preview, Development |
| `TIKTOK_REDIRECT_URI` | `https://scheduler-silk-tau.vercel.app/api/auth/callback/tiktok` | Production, Preview, Development |

4. After adding, trigger a new deployment (or wait for auto-deploy from GitHub push)

### 3. Verify Sandbox Target User
- Ensure your TikTok test account is added as a "Target User" in the Sandbox settings
- The account must be in Sandbox mode to test

### 4. Test the Connection
1. Wait for Vercel deployment to complete
2. Go to: `https://scheduler-silk-tau.vercel.app`
3. Navigate to the connections/dashboard page
4. Click "Connect TikTok"
5. You should now see the TikTok authorization page (not the error)

## Technical Details

### TikTok Login Kit for Web Requirements
- **Authorization URL**: `https://www.tiktok.com/v2/auth/authorize/`
- **Required Parameters**:
  - `client_key` - Your app's client key
  - `scope` - Permissions (e.g., `user.info.basic,video.upload,video.publish`)
  - `response_type` - Always `code`
  - `redirect_uri` - Must be HTTPS and registered
  - `state` - CSRF protection token
- **NOT Required**: `code_challenge`, `code_challenge_method`, `code_verifier`

### Token Exchange
- **Endpoint**: `https://open.tiktokapis.com/v2/oauth/token/`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Required Body Parameters**:
  - `client_key`
  - `client_secret`
  - `code` (authorization code)
  - `grant_type` (always `authorization_code`)
  - `redirect_uri` (must match the one used in authorization)
- **NOT Required**: `code_verifier`

## Troubleshooting

If you still get errors after following the steps above:

1. **Double-check redirect URI** - It must match EXACTLY in both:
   - TikTok Developer Portal
   - Vercel environment variables
   - No typos, correct protocol (https://), no trailing slash

2. **Verify Sandbox mode** - Make sure:
   - Your app is in Sandbox mode
   - Login Kit product is enabled
   - Target user is added

3. **Check Vercel deployment** - Ensure:
   - Environment variables are set
   - Latest code is deployed
   - No build errors

4. **Clear cookies** - Before testing, clear browser cookies for your domain

## References
- TikTok Login Kit Web Documentation: https://developers.tiktok.com/doc/login-kit-web
- TikTok OAuth 2.0: https://developers.tiktok.com/doc/oauth-user-access-token-management
