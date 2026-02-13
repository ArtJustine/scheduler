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
            // Fetch basic profile and follower count
            const threadsResponse = await fetch(
                `https://graph.threads.net/me?fields=id,username,threads_profile_picture_url,follower_count&access_token=${tokenData.access_token}`
            )
            if (threadsResponse.ok) {
                const threadsData = await threadsResponse.json()
                threadsUsername = threadsData.username || threadsUsername
                threadsId = threadsData.id
                profileImage = threadsData.threads_profile_picture_url
                followerCount = threadsData.follower_count || 0
            }

            // Fetch threads to get a count (limit=1 just to check paging)
            const mediaResponse = await fetch(
                `https://graph.threads.net/me/threads?limit=1&access_token=${tokenData.access_token}`
            )
            if (mediaResponse.ok) {
                const mediaData = await mediaResponse.json()
                // Threads API doesn't always provide total_count in paging, but we'll check if it does
                // If not, we can only count what's in the data array or leave as is
                if (mediaData.paging?.total_count) {
                    postsCount = mediaData.paging.total_count
                } else if (mediaData.data) {
                    // This is only the first page, but better than nothing or we can skip it
                    // For now, let's keep it as 0 if we can't get a reliable total_count
                }
            }
        } catch (err) {
            console.warn("Could not fetch Threads user info or stats:", err)
        }

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
