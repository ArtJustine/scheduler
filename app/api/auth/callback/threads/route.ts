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

        // 1. Exchange for Long-Lived Token (highly recommended for Threads)
        let accessToken = tokenData.access_token
        try {
            console.log("Exchanging for long-lived Threads token...")
            const exchangeUrl = `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${config.threads.appSecret}&access_token=${tokenData.access_token}`
            const exchangeResponse = await fetch(exchangeUrl)
            if (exchangeResponse.ok) {
                const exchangeData = await exchangeResponse.json()
                accessToken = exchangeData.access_token || accessToken
                console.log("Long-lived token obtained")
            }
        } catch (err) {
            console.warn("Could not exchange for long-lived token, using short-lived:", err)
        }

        // Get user info and stats from Threads
        let threadsUsername = "Threads User"
        let threadsId = null
        let profileImage = null
        let followerCount = 0
        let postsCount = 0

        // 2. Fetch basic profile fields we are 100% sure about
        try {
            console.log("Fetching basic Threads profile...")
            const profileUrl = `https://graph.threads.net/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
            const profileRes = await fetch(profileUrl)
            if (profileRes.ok) {
                const profileData = await profileRes.json()
                threadsUsername = profileData.username || profileData.name || threadsUsername
                threadsId = profileData.id
                profileImage = profileData.threads_profile_picture_url
                console.log("Basic profile fetched for:", threadsUsername)
            } else {
                console.error("Basic profile fetch failed", await profileRes.text())
            }
        } catch (err) {
            console.error("Error fetching basic profile:", err)
        }

        // 3. Simple and robust stats fetch via shared service
        try {
            console.log("Fetching Threads stats via shared service...")
            const { fetchThreadsStats } = await import("@/lib/threads-service")
            const stats = await fetchThreadsStats(accessToken, threadsId, threadsUsername)

            followerCount = stats.followers
            postsCount = stats.posts
            console.log("Stats fetch complete:", stats)
        } catch (err) {
            console.warn("Follower fetch process failed, using defaults:", err)
        }

        // Ensure clean numbers
        followerCount = Number(followerCount) || 0
        postsCount = Number(postsCount) || 0

        // Prepare account data for handover
        const accountData = {
            platform: "threads",
            id: threadsId || userId,
            username: threadsUsername,
            profileImage: profileImage,
            accessToken: accessToken, // Use the long-lived one if we got it
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
