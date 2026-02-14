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
    let tokenData;
    try {
      // Try regular Instagram first (Basic Display)
      tokenData = await instagramOAuth.exchangeCodeForToken(code, storedRedirectUri)
    } catch (igErr) {
      console.log("Instagram Basic exchange failed, trying Facebook Graph exchange...")
      try {
        // Fallback to Facebook Graph exchange (for Business accounts)
        const { facebookOAuth } = await import("@/lib/oauth-utils")
        tokenData = await facebookOAuth.exchangeCodeForToken(code, storedRedirectUri)
      } catch (fbErr) {
        throw new Error(`Instagram/Facebook exchange failed: ${igErr instanceof Error ? igErr.message : igErr}`)
      }
    }

    // Get user info and stats from Instagram
    let username = "instagram_user"
    let profilePicture = null
    let followerCount = 0
    let postsCount = 0

    // 2. Fetch User Info and Stats
    try {
      if (tokenData.platform === "facebook" || !tokenData.user_id) {
        // Professional Account Flow (via Facebook)
        console.log("Fetching Instagram Business info via Facebook Pages...")
        const pagesUrl = `https://graph.facebook.com/v${config.facebook.apiVersion}/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}&access_token=${tokenData.access_token}`
        const pagesRes = await fetch(pagesUrl)
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          const igAccount = pagesData.data?.find((p: any) => p.instagram_business_account)?.instagram_business_account

          if (igAccount) {
            console.log("Found Linked Instagram Business Account:", igAccount.username)
            username = igAccount.username || username
            profilePicture = igAccount.profile_picture_url
            followerCount = Number(igAccount.followers_count ?? igAccount.follower_count) || 0
            postsCount = Number(igAccount.media_count) || 0
          }
        }
      } else {
        // Basic Display Flow
        const userInfoResponse = await fetch(
          `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`
        )
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json()
          username = userInfo.username || username
          postsCount = Number(userInfo.media_count) || 0
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

    // Ensure everything is a number
    followerCount = Number(followerCount) || 0
    postsCount = Number(postsCount) || 0

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
