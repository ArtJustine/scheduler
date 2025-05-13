import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { firebaseDb, firebaseAuth } from "@/lib/firebase-client"
import { doc, setDoc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest) {
  // Get the authorization code and state from the query parameters
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Get the stored state from the cookie
  const cookieStore = cookies()
  const storedState = cookieStore.get("tiktok_oauth_state")?.value

  // If there's an error or the state doesn't match, redirect to the error page
  if (error || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/dashboard/connections?error=${error || "invalid_state"}`,
    )
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch("https://open-api.tiktok.com/oauth/access_token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.data || !tokenData.data.access_token) {
      throw new Error("Failed to get access token")
    }

    const accessToken = tokenData.data.access_token
    const openId = tokenData.data.open_id

    // Get the user's TikTok profile information
    const userInfoResponse = await fetch(
      `https://open-api.tiktok.com/user/info/?open_id=${openId}&access_token=${accessToken}`,
    )

    const userInfoData = await userInfoResponse.json()

    if (!userInfoData.data || !userInfoData.data.user) {
      throw new Error("Failed to get user profile")
    }

    const user = userInfoData.data.user
    const username = user.display_name || user.unique_id
    const followerCount = user.follower_count || 0
    const videoCount = user.video_count || 0

    // Store the access token and user information in Firestore
    const firebaseUser = firebaseAuth.currentUser

    if (!firebaseUser) {
      throw new Error("User not authenticated")
    }

    const userDocRef = doc(firebaseDb, "users", firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {})
    }

    // Update the user document with the TikTok account information
    await setDoc(
      userDocRef,
      {
        tiktok: {
          id: openId,
          username: username,
          accessToken: accessToken,
          connected: true,
          connectedAt: new Date().toISOString(),
          followers: followerCount,
          followersGrowth: 0,
          engagement: 0,
          impressions: 0,
          posts: videoCount,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true },
    )

    // Redirect to the connections page with a success message
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard/connections?success=true`)
  } catch (error) {
    console.error("Error connecting TikTok account:", error)

    // Redirect to the connections page with an error message
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard/connections?error=connection_failed`)
  }
}
