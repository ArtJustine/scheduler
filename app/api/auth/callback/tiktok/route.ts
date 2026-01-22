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
    const codeVerifier = cookieStore.get("tiktok_code_verifier")?.value // Optional for web
    const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_tiktok_auth", request.url))
    }

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
    }

    // Exchange authorization code for access token (code verifier is optional for web)
    const tokenData = await tiktokOAuth.exchangeCodeForToken(code, codeVerifier, storedRedirectUri)

    // Get user info from TikTok
    let username = "tiktok_user"
    let openId = null
    try {
      const userInfoResponse = await fetch(
        `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name&access_token=${tokenData.access_token}`
      )
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        if (userInfo.data && userInfo.data.user) {
          username = userInfo.data.user.display_name || username
          openId = userInfo.data.user.open_id || null
        }
      }
    } catch (err) {
      console.warn("Could not fetch TikTok user info:", err)
    }

    // Save to Firestore
    if (serverDb) {
      const userDocRef = doc(serverDb, "users", userId)
      const userDoc = await getDoc(userDocRef)

      const accountData = {
        id: openId || userId,
        username,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        connectedAt: new Date().toISOString(),
        connected: true, // Explicitly set connected to true
        openId,
      }

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          tiktok: accountData,
          updatedAt: new Date().toISOString(),
        })
      } else {
        await setDoc(userDocRef, {
          tiktok: accountData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Clear OAuth cookies
    const response = NextResponse.redirect(new URL("/dashboard/connections?success=tiktok_connected", request.url))
    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")
    response.cookies.delete("tiktok_code_verifier")
    response.cookies.delete("oauth_redirect_uri")

    return response
  } catch (error: any) {
    console.error("TikTok callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/connections?error=tiktok_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
  }
}
