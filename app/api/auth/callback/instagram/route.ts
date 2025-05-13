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
  const storedState = cookieStore.get("instagram_oauth_state")?.value

  // If there's an error or the state doesn't match, redirect to the error page
  if (error || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/dashboard/connections?error=${error || "invalid_state"}`,
    )
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/instagram`,
        code: code!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get the user's profile information
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`,
    )

    const profileData = await profileResponse.json()

    if (!profileData.username) {
      throw new Error("Failed to get user profile")
    }

    // Get additional account information
    const accountResponse = await fetch(
      `https://graph.instagram.com/me/accounts?access_token=${tokenData.access_token}`,
    )

    const accountData = await accountResponse.json()

    // Store the access token and user information in Firestore
    const user = firebaseAuth.currentUser

    if (!user) {
      throw new Error("User not authenticated")
    }

    const userDocRef = doc(firebaseDb, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {})
    }

    // Update the user document with the Instagram account information
    await setDoc(
      userDocRef,
      {
        instagram: {
          id: profileData.id,
          username: profileData.username,
          accessToken: tokenData.access_token,
          connected: true,
          connectedAt: new Date().toISOString(),
          followers: 0, // We'll update this with real data
          followersGrowth: 0,
          engagement: 0,
          impressions: 0,
          posts: 0,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true },
    )

    // Redirect to the connections page with a success message
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard/connections?success=true`)
  } catch (error) {
    console.error("Error connecting Instagram account:", error)

    // Redirect to the connections page with an error message
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard/connections?error=connection_failed`)
  }
}
