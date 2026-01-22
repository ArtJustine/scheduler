# TikTok Connection Debugging Guide

## Current Status
✅ TikTok OAuth is working (no more errors during authorization)
❌ Connected accounts are not showing in the UI

## What We Need to Debug

### Step 1: Check Browser Console
1. Go to: `https://scheduler-silk-tau.vercel.app/dashboard/connections`
2. Open browser console (F12 → Console tab)
3. Look for these log messages:
   - `Platform: TikTok, Connected Account: ...`
   - `All connected accounts: ...`
   - `Sidebar - Channel: TikTok, Platform key: tiktok, Connected: ...`

### Step 2: What to Look For

**Expected Data Structure:**
```javascript
// In connections page
connectedAccounts = [
  {
    id: "some_id",
    platform: "tiktok",  // lowercase
    username: "your_tiktok_username",
    connected: true,
    profileImage: "..."
  }
]

// In sidebar
connectedAccounts = {
  tiktok: {
    id: "some_id",
    username: "your_tiktok_username",
    accessToken: "...",
    ...
  }
}
```

### Step 3: Possible Issues

**Issue A: No Data in Firestore**
- If console shows empty arrays/objects
- Solution: Data wasn't saved during OAuth callback
- Check: Firestore console → users collection → your user ID

**Issue B: Wrong User ID**
- If data exists in Firestore but not loading
- The userId in OAuth callback might not match current user
- Check: Compare userId in Firestore with current auth user ID

**Issue C: Data Structure Mismatch**
- If data exists but wrong format
- The platform key might be capitalized or have extra fields
- Check: Console logs will show the exact structure

## How to Check Firestore Directly

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `socialmedia-scheduler-eb22f`
3. Go to Firestore Database
4. Navigate to: `users` collection
5. Find your user document (by email or UID)
6. Check if `tiktok` field exists with data like:
   ```
   tiktok: {
     id: "...",
     username: "...",
     accessToken: "...",
     refreshToken: "...",
     connectedAt: "...",
     openId: "..."
   }
   ```

## Quick Fixes to Try

### Fix 1: Force Refresh
After connecting TikTok:
1. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+F5)
2. Check if accounts appear

### Fix 2: Clear Cookies and Reconnect
1. Clear browser cookies for vercel.app
2. Log out and log back in
3. Try connecting TikTok again

### Fix 3: Check Network Tab
1. Open DevTools → Network tab
2. Refresh the page
3. Look for Firestore requests
4. Check if they're returning data

## Send Me This Information

Please provide:
1. **Screenshot of browser console** showing the debug logs
2. **Screenshot of Firestore** showing your user document with tiktok field
3. **Your current user ID** (you can get this from console: `firebase.auth().currentUser.uid`)

This will help me identify exactly what's wrong!
