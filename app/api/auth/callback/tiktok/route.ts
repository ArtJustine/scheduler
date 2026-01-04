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
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=tiktok_auth_failed&message=${error}`
      )
    }

    // Validate state
    const savedState = cookies().get("oauth_state")?.value
    const userId = cookies().get("oauth_user_id")?.value
    const codeVerifier = cookies().get("tiktok_code_verifier")?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=invalid_tiktok_auth`
      )
    }

    if (!userId) {
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=user_not_found`
      )
    }

    if (!codeVerifier) {
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=missing_code_verifier`
      )
    }

    // Exchange authorization code for access token
    const tokenData = await tiktokOAuth.exchangeCodeForToken(code, codeVerifier)

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
    const response = NextResponse.redirect(
      `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?success=tiktok_connected`
    )
    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")
    response.cookies.delete("tiktok_code_verifier")

    return response
  } catch (error: any) {
    console.error("TikTok callback error:", error)
    return NextResponse.redirect(
      `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=tiktok_callback_failed&message=${error.message}`
    )
  }
}
