# Instructions for Adding TikTok Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: scheduler-silk-tau
3. Go to Settings → Environment Variables
4. Add the following variables:

**Variable Name:** TIKTOK_CLIENT_KEY
**Value:** your_tiktok_client_key
**Environment:** Production, Preview, Development

**Variable Name:** TIKTOK_CLIENT_SECRET
**Value:** your_tiktok_client_secret
**Environment:** Production, Preview, Development

**Variable Name:** TIKTOK_REDIRECT_URI
**Value:** https://scheduler-silk-tau.vercel.app/api/auth/callback/tiktok
**Environment:** Production, Preview, Development

5. After adding these, redeploy your application or wait for the next automatic deployment
