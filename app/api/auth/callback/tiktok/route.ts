// TikTok OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { tiktokOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"
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
      console.error("TikTok OAuth error:", error)
      return NextResponse.redirect(new URL(`/dashboard/connections?error=tiktok_auth_failed&message=${error}`, request.url))
    }

    // Validate state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    const userId = cookieStore.get("oauth_user_id")?.value
    const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value
    const codeVerifier = cookieStore.get("oauth_code_verifier")?.value

    if (!code || !state || state !== savedState) {
      console.error("TikTok state mismatch or missing code", { code: !!code, state, savedState })
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_tiktok_auth", request.url))
    }

    if (!userId) {
      console.error("TikTok userId not found in cookies")
      return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
    }

    if (!codeVerifier) {
      console.error("TikTok code_verifier not found in cookies")
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_tiktok_auth", request.url))
    }

    // Exchange authorization code for access token with PKCE code_verifier
    const tokenData = await tiktokOAuth.exchangeCodeForToken(code, storedRedirectUri, codeVerifier)

    // Get user info from TikTok
    let username = "TikTok User"
    let openId = null
    let profileImage = null
    let followerCount = 0

    try {
      const userInfoResponse = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      )
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        if (userInfo.data && userInfo.data.user) {
          username = userInfo.data.user.display_name || username
          openId = userInfo.data.user.open_id || null
          profileImage = userInfo.data.user.avatar_url || null
        }
      } else {
        const errorData = await userInfoResponse.json()
        console.warn("TikTok user info error:", errorData)
      }
    } catch (err) {
      console.warn("Could not fetch TikTok user info:", err)
    }

    // Prepare account data
    const accountData = {
      platform: "tiktok",
      id: openId || userId,
      username,
      profileImage,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      connectedAt: new Date().toISOString(),
      connected: true,
      openId,
      followers: followerCount,
    }

    // Save to Firestore directly from the server for better reliability
    try {
      if (serverDb) {
        const userDocRef = doc(serverDb, "users", userId)
        await updateDoc(userDocRef, {
          tiktok: {
            ...accountData,
            updatedAt: new Date().toISOString()
          }
        })
        console.log("TikTok account saved to Firestore for user:", userId)
      }
    } catch (saveError) {
      console.error("Error saving TikTok account to Firestore:", saveError)
      // We'll still try the handover cookie as a fallback
    }

    // Redirect to dashboard with success flag
    const response = NextResponse.redirect(new URL("/dashboard/connections?success=tiktok_connected", request.url))

    // Set handover cookie as fallback (still useful for immediate UI update without wait)
    response.cookies.set("social_handover_data", JSON.stringify(accountData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300,
      path: "/",
      sameSite: "lax",
    })

    // Clear OAuth state cookies
    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")
    response.cookies.delete("oauth_redirect_uri")
    response.cookies.delete("oauth_code_verifier")

    return response
  } catch (error: any) {
    console.error("TikTok callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/connections?error=tiktok_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
  }
}
