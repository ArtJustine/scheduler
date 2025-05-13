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
  const storedState = cookieStore.get("youtube_oauth_state")?.value

  // If there's an error or the state doesn't match, redirect to the error page
  if (error || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/dashboard/connections?error=${error || "invalid_state"}`,
    )
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/youtube`,
        code: code!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get the user's YouTube channel information
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    )

    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error("Failed to get YouTube channel")
    }

    const channel = channelData.items[0]
    const channelId = channel.id
    const channelTitle = channel.snippet.title
    const subscriberCount = Number.parseInt(channel.statistics.subscriberCount, 10) || 0
    const videoCount = Number.parseInt(channel.statistics.videoCount, 10) || 0

    // Store the access token and channel information in Firestore
    const user = firebaseAuth.currentUser

    if (!user) {
      throw new Error("User not authenticated")
    }

    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {})
    }

    // Update the user document with the YouTube account information
    await setDoc(
      userDocRef,
      {
        youtube: {
          id: channelId,
          username: channelTitle,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          connected: true,
          connectedAt: new Date().toISOString(),
          followers: subscriberCount,
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
    console.error("Error connecting YouTube account:", error)

    // Redirect to the connections page with an error message
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard/connections?error=connection_failed`)
  }
}
