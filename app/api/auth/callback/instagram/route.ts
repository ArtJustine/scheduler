// Instagram OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { cookies } from "next/headers"
import { instagramOAuth } from "@/lib/oauth-utils"
import { serverDb } from "@/lib/firebase-server"
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("Instagram OAuth error:", error)
      return NextResponse.redirect(new URL(`/dashboard/connections?error=instagram_auth_failed&message=${error}`, request.url))
    }

    // Validate state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    const userId = cookieStore.get("oauth_user_id")?.value
    const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_instagram_auth", request.url))
    }

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
    }

    // Exchange authorization code for access token
    const tokenData = await instagramOAuth.exchangeCodeForToken(code, storedRedirectUri)

    // Get user info and stats from Instagram
    let username = "instagram_user"
    let profilePicture = null
    let followerCount = 0
    let postsCount = 0

    try {
      const userInfoResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`
      )
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        username = userInfo.username || username
        postsCount = userInfo.media_count || 0
      }
    } catch (err) {
      console.warn("Could not fetch Instagram user info:", err)
    }

    // Prepare account data for handover
    const accountData = {
      platform: "instagram",
      id: tokenData.user_id || userId,
      username,
      profileImage: profilePicture,
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

    // Save to Firestore directly from the server for better reliability
    try {
      if (serverDb) {
        const workspaceId = cookieStore.get("oauth_workspace_id")?.value

        if (workspaceId) {
          const workspaceDocRef = doc(serverDb, "workspaces", workspaceId)
          await updateDoc(workspaceDocRef, {
            [`accounts.${accountData.platform}`]: {
              ...accountData,
              updatedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          } as any)
          console.log("Instagram account saved to Workspace:", workspaceId)
        } else {
          const userDocRef = doc(serverDb, "users", userId)
          await setDoc(userDocRef, {
            instagram: {
              ...accountData,
              updatedAt: new Date().toISOString()
            }
          }, { merge: true })
          console.log("Instagram account saved to User Doc:", userId)
        }
      }
    } catch (saveError) {
      console.error("Error saving Instagram account to Firestore:", saveError)
    }

    // Redirect to dashboard with handover flag
    const response = NextResponse.redirect(new URL("/dashboard/connections?success=instagram_connected&handover=true", request.url))

    // Set handover cookie (short-lived, accessible by client)
    response.cookies.set("social_handover_data", JSON.stringify(accountData), {
      httpOnly: false, // Must be accessible by client-side JS
      secure: process.env.NODE_ENV === "production",
      maxAge: 300, // 5 minutes
      path: "/",
      sameSite: "lax",
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
