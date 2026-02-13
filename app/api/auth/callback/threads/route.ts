// Threads OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { threadsOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { serverDb } from "@/lib/firebase-server"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const error = searchParams.get("error")

        // Handle OAuth errors
        if (error) {
            console.error("Threads OAuth error:", error)
            return NextResponse.redirect(new URL(`/dashboard/connections?error=threads_auth_failed&message=${error}`, request.url))
        }

        // Validate state
        const cookieStore = await cookies()
        const savedState = cookieStore.get("oauth_state")?.value
        const userId = cookieStore.get("oauth_user_id")?.value
        const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

        if (!code || !state || state !== savedState) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_threads_auth", request.url))
        }

        if (!userId) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
        }

        // Exchange authorization code for access token
        const tokenData = await threadsOAuth.exchangeCodeForToken(code, storedRedirectUri)

        // Get user info and stats from Threads
        let threadsUsername = "Threads User"
        let threadsId = null
        let profileImage = null
        let followerCount = 0
        let postsCount = 0

        try {
            // 1. Fetch basic profile with as many fields as possible
            console.log("Fetching Threads profile...")
            const profileUrl = `https://graph.threads.net/me?fields=id,username,name,threads_profile_picture_url,follower_count,media_count&access_token=${tokenData.access_token}`
            const threadsResponse = await fetch(profileUrl)

            if (threadsResponse.ok) {
                const threadsData = await threadsResponse.json()
                console.log("Threads Profile Data:", JSON.stringify(threadsData))
                threadsUsername = threadsData.username || threadsData.name || threadsUsername
                threadsId = threadsData.id
                profileImage = threadsData.threads_profile_picture_url || threadsData.profile_picture_url

                // Try to get follower count from different possible field names
                followerCount = threadsData.follower_count ?? threadsData.followers_count ?? 0
                postsCount = threadsData.media_count ?? 0
            } else {
                const errText = await threadsResponse.text()
                console.error("Threads Profile Fetch Failed:", threadsResponse.status, errText)
            }

            // 2. Fallback for stats if still 0
            if (followerCount === 0) {
                const insightsUrl = `https://graph.threads.net/${threadsId || 'me'}/threads_insights?metric=followers_count&access_token=${tokenData.access_token}`
                const insightsResponse = await fetch(insightsUrl)
                if (insightsResponse.ok) {
                    const insightsData = await insightsResponse.json()
                    if (insightsData.data && insightsData.data.length > 0) {
                        followerCount = insightsData.data[0].values[0].value || 0
                    }
                }
            }

            // 3. Fallback for post count by fetching threads list
            if (postsCount === 0) {
                const mediaResponse = await fetch(
                    `https://graph.threads.net/me/threads?fields=id&access_token=${tokenData.access_token}`
                )
                if (mediaResponse.ok) {
                    const mediaData = await mediaResponse.json()
                    if (mediaData.data) {
                        postsCount = mediaData.data.length
                        // If paging exists, we know it's at least this many
                        if (mediaData.paging?.next) {
                            // We could try to get a better count, but let's stick to first page for now
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("Could not fetch Threads user info or stats:", err)
        }

        // Ensure everything is a number
        followerCount = Number(followerCount) || 0
        postsCount = Number(postsCount) || 0

        // Prepare account data for handover
        const accountData = {
            platform: "threads",
            id: threadsId || userId,
            username: threadsUsername,
            profileImage: profileImage,
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
                    console.log("Threads account saved to Workspace:", workspaceId)
                } else {
                    const userDocRef = doc(serverDb, "users", userId)
                    await setDoc(userDocRef, {
                        threads: {
                            ...accountData,
                            updatedAt: new Date().toISOString()
                        }
                    }, { merge: true })
                    console.log("Threads account saved to User Doc:", userId)
                }
            }
        } catch (saveError) {
            console.error("Error saving Threads account to Firestore:", saveError)
        }

        // Redirect to dashboard with handover flag
        const response = NextResponse.redirect(new URL("/dashboard/connections?success=threads_connected&handover=true", request.url))

        // Set handover cookie (short-lived, accessible by client)
        response.cookies.set("social_handover_data", JSON.stringify(accountData), {
            httpOnly: false, // Must be accessible by client-side JS
            secure: process.env.NODE_ENV === "production",
            maxAge: 300, // 5 minutes
            path: "/",
            sameSite: "lax",
        })

        // Clear cookies
        response.cookies.delete("oauth_state")
        response.cookies.delete("oauth_user_id")
        response.cookies.delete("oauth_redirect_uri")
        response.cookies.delete("oauth_workspace_id")

        return response
    } catch (error: any) {
        console.error("Threads callback error:", error)
        return NextResponse.redirect(new URL(`/dashboard/connections?error=threads_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
    }
}
