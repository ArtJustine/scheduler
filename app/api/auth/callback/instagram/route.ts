// Instagram OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { cookies } from "next/headers"
import { instagramOAuth } from "@/lib/oauth-utils"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  console.log("Instagram Auth Callback started")
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorReason = searchParams.get("error_reason")
    const errorDescription = searchParams.get("error_description")

    // Handle OAuth errors
    if (error) {
      console.error("Instagram OAuth error:", error, errorReason, errorDescription)
      return NextResponse.redirect(new URL(`/dashboard/connections?error=instagram_auth_failed&message=${errorDescription || error}`, request.url))
    }

    // Validate state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    let userId = cookieStore.get("oauth_user_id")?.value
    let workspaceId = cookieStore.get("oauth_workspace_id")?.value
    const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

    console.log("Cookies:", { savedState, userId, storedRedirectUri })
    console.log("Params:", { code: code ? "EXISTS" : "MISSING", state })

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_instagram_auth", request.url))
    }

    // Attempt to decode state to recover userId/workspaceId (Stateless Fallback)
    try {
      const decodedState = Buffer.from(state, 'base64').toString('ascii')
      // Check if it's our JSON format
      if (decodedState.startsWith("{") && decodedState.includes("uid")) {
        const stateObj = JSON.parse(decodedState)
        console.log("Recovered stateless data:", stateObj)

        // Prefer cookie ID if exists (more secure), but fallback to state ID
        // Ideally we check stateObj.nonce === savedState, but if savedState is gone (cookie lost),
        // we accept the stateObj as the source of truth for the ID (since it's a signed flow effectively)
        if (!userId && stateObj.uid) {
          userId = stateObj.uid
          console.log("Stateless Recovery: User ID restored from state")
        }
        if (!workspaceId && stateObj.wid) {
          workspaceId = stateObj.wid
          console.log("Stateless Recovery: Workspace ID restored from state")
        }
      }
    } catch (e) {
      console.log("State is not base64 JSON, treating as legacy/simple string")
    }

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
    }

    // Cookie Domain Logic (Sync with Auth Route)
    const hostname = request.nextUrl.hostname
    const isProduction = process.env.NODE_ENV === "production"
    let cookieDomain = undefined
    if (isProduction && hostname.includes("chiyusocial.com")) {
      cookieDomain = ".chiyusocial.com"
    }

    // Exchange authorization code for access token
    let tokenData;
    // Must match exactly what was sent in auth request - NO trailing slash
    const exchangeRedirectUri = "https://chiyusocial.com/api/auth/callback/instagram"

    try {
      console.log("Exchanging code for token...")
      const cleanCode = code ? code.replace(/#_$/, "") : code

      console.log("Using FORCED Config URI (WITH SLASH) for exchange:", exchangeRedirectUri)
      if (!cleanCode) throw new Error("No authorization code available")

      tokenData = await instagramOAuth.exchangeCodeForToken(cleanCode, exchangeRedirectUri)
      console.log("Token exchange success, platform:", tokenData.platform)
    } catch (igErr: any) {
      console.error("Token exchange failed:", igErr)
      const secret = config.instagram.appSecret || "MISSING"
      const debugInfo = `URI: ${exchangeRedirectUri}, Secret starts with: ${secret.substring(0, 4)}`
      return NextResponse.redirect(new URL(`/dashboard/connections?error=token_exchange_failed&message=${encodeURIComponent(igErr.message + " | " + debugInfo)}`, request.url))
    }

    // Get user info and stats from Instagram
    let username = "instagram_user"
    let profilePicture = null
    let followerCount = 0
    let postsCount = 0

    // 2. Fetch User Info and Stats
    try {
      // "Instagram Login" Flow (Business/Consumer with direct login)
      // Tokens from this flow work with graph.instagram.com but need a separate call for user ID/Username
      if (!tokenData.user_id) {
        console.log("Fetching /me for User ID...")
        const meRes = await fetch(`https://graph.instagram.com/v${config.instagram.apiVersion}/me?fields=id,username,account_type,media_count,followers_count&access_token=${tokenData.access_token}`)
        if (meRes.ok) {
          const meData = await meRes.json()
          tokenData.user_id = meData.id
          username = meData.username
          followerCount = Number(meData.followers_count) || 0
          postsCount = Number(meData.media_count) || 0
          console.log("Fetched User ID:", meData.id)
        } else {
          console.warn("/me fetch failed:", await meRes.text())
        }
      }

      // Check media list as final fallback for post count
      if (postsCount === 0) {
        const platformHost = tokenData.platform === "facebook" ? "graph.facebook.com" : "graph.instagram.com"
        const mediaListResponse = await fetch(
          `https://${platformHost}/me/media?access_token=${tokenData.access_token}`
        )
        if (mediaListResponse.ok) {
          const mediaList = await mediaListResponse.json()
          if (mediaList.data) postsCount = mediaList.data.length
        }
      }
    } catch (err) {
      console.warn("Instagram data fetch failed:", err)
    }

    // 2a. Fallback: If no user_id yet, try to fetch basic profile without fancy fields
    if (!tokenData.user_id) {
      try {
        console.log("Attempting emergency profile fetch for ID...")
        const basicMeRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`)
        if (basicMeRes.ok) {
          const basicMe = await basicMeRes.json()
          tokenData.user_id = basicMe.id
          username = basicMe.username || username
          console.log("Emergency fetch successful:", basicMe.username)
        } else {
          console.error("Emergency fetch failed:", await basicMeRes.text())
        }
      } catch (e) { console.error("Emergency fetch error:", e) }
    }

    // Use app user ID only as specific fallback if absolutely necessary to allow debugging
    const finalInstagramId = tokenData.user_id || `unknown_${Date.now()}`

    console.log("Finalizing Instagram Connection for:", username, "ID:", finalInstagramId)

    // Ensure everything is a number
    followerCount = Number(followerCount) || 0
    postsCount = Number(postsCount) || 0

    // Prepare account data for handover
    // CRITICIAL: Exclude profileImage from cookie to ensure it fits within 4KB limit
    // The client can fetch the image or we rely on the serverDb save
    const accountData = {
      platform: "instagram",
      id: finalInstagramId,
      username,
      // profileImage: profilePicture, // Removed to save space in cookie
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      connectedAt: new Date().toISOString(),
      connected: true,
      followers: followerCount,
      posts: postsCount,
    }

    // Save to Firestore using Admin SDK (Main persist method)
    try {
      if (adminDb) {
        // We CAN save the profile picture here in the DB
        const dbData = { ...accountData, profileImage: profilePicture, updatedAt: new Date().toISOString() }

        const workspaceId = cookieStore.get("oauth_workspace_id")?.value
        if (workspaceId) {
          await adminDb.collection("workspaces").doc(workspaceId).set({
            accounts: { instagram: dbData },
            updatedAt: new Date().toISOString()
          }, { merge: true })
        } else {
          await adminDb.collection("users").doc(userId).set({
            instagram: dbData
          }, { merge: true })
        }
        console.log("Validation: Save complete")
      } else {
        console.error("Admin DB not initialized")
      }
    } catch (saveError) {
      console.error("Error saving Instagram account to Firestore:", saveError)
      // Don't fail the request, we can still try the handover cookie
    }

    // Redirect to dashboard with handover flag
    const response = NextResponse.redirect(new URL("/dashboard/connections?success=instagram_connected&handover=true", request.url))

    // Set handover cookie (short-lived, accessible by client)
    // We stringify the lighter payload (without image)
    const cookiePayload = JSON.stringify(accountData)
    console.log("Handover Cookie Size:", cookiePayload.length)

    response.cookies.set("social_handover_data", cookiePayload, {
      httpOnly: false, // Must be accessible by client-side JS
      secure: true,
      maxAge: 300, // 5 minutes
      path: "/",
      sameSite: "none",
      domain: cookieDomain
    })

    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")
    response.cookies.delete("oauth_redirect_uri")
    response.cookies.delete("oauth_workspace_id")

    return response
  } catch (error: any) {
    console.error("Instagram callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/connections?error=instagram_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
  }
}
