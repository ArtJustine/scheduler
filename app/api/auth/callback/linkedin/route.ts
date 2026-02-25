// LinkedIn OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { linkedinOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const error = searchParams.get("error")

        // Handle OAuth errors
        if (error) {
            console.error("LinkedIn OAuth error:", error)
            return NextResponse.redirect(new URL(`/dashboard/connections?error=linkedin_auth_failed&message=${error}`, request.url))
        }

        // Validate state
        const cookieStore = await cookies()
        const savedState = cookieStore.get("oauth_state")?.value
        const userId = cookieStore.get("oauth_user_id")?.value
        const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

        if (!code || !state || state !== savedState) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_linkedin_auth", request.url))
        }

        if (!userId) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
        }

        // Exchange authorization code for access token
        const tokenData = await linkedinOAuth.exchangeCodeForToken(code, storedRedirectUri)

        // Get user info from LinkedIn
        let lnName = "LinkedIn User"
        let lnId = null
        let lnPicture = null

        try {
            // Fetch basic profile info including the real member ID (me endpoint)
            const meResponse = await fetch(
                "https://api.linkedin.com/v2/me",
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                }
            )

            if (meResponse.ok) {
                const meData = await meResponse.json()
                lnId = meData.id
                lnName = `${meData.localizedFirstName} ${meData.localizedLastName}`
            }

            // Also fetch from userinfo for name/picture (OpenID)
            const lnResponse = await fetch(
                "https://api.linkedin.com/v2/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                }
            )
            if (lnResponse.ok) {
                const lnData = await lnResponse.json()
                if (!lnId) lnId = lnData.sub // Fallback if me failed
                lnName = lnData.name || lnName
                lnPicture = lnData.picture
            }
        } catch (err) {
            console.warn("Could not fetch LinkedIn user info:", err)
        }

        // Prepare account data for handover
        let followers = 0
        let posts = 0
        try {
            const { fetchLinkedInStats } = await import("@/lib/linkedin-service")
            const stats = await fetchLinkedInStats(tokenData.access_token, lnId || userId)
            followers = stats.followers
            posts = stats.posts
        } catch (statsErr) {
            console.warn("Could not fetch LinkedIn stats during callback:", statsErr)
        }

        const accountData = {
            platform: "linkedin",
            id: lnId || userId,
            username: lnName,
            profileImage: lnPicture,
            followers,
            posts,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                : null,
            connectedAt: new Date().toISOString(),
            connected: true,
        }

        // Save to Firestore directly from the server using adminDb for reliability
        try {
            if (adminDb) {
                let workspaceId = cookieStore.get("oauth_workspace_id")?.value
                const timestamp = new Date().toISOString()

                // If workspaceId is missing, try to find the user's active workspace
                if (!workspaceId && userId) {
                    const userDoc = await adminDb.collection("users").doc(userId).get()
                    if (userDoc.exists) {
                        workspaceId = userDoc.data()?.activeWorkspaceId
                    }
                }

                if (workspaceId) {
                    const workspaceRef = adminDb.collection("workspaces").doc(workspaceId)
                    await workspaceRef.update({
                        [`accounts.${accountData.platform}`]: {
                            ...accountData,
                            updatedAt: timestamp
                        },
                        updatedAt: timestamp
                    })
                    console.log(`LinkedIn account (${lnId}) saved to Workspace:`, workspaceId)
                } else {
                    const userRef = adminDb.collection("users").doc(userId)
                    await userRef.update({
                        [accountData.platform]: {
                            ...accountData,
                            updatedAt: timestamp
                        },
                        updatedAt: timestamp
                    })
                    console.log(`LinkedIn account (${lnId}) saved to User Doc:`, userId)
                }
            }
        } catch (saveError) {
            console.error("Error saving LinkedIn account to Firestore:", saveError)
        }

        // Redirect to dashboard with handover flag
        const response = NextResponse.redirect(new URL("/dashboard/connections?success=linkedin_connected&handover=true", request.url))

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
        console.error("LinkedIn callback error:", error)
        return NextResponse.redirect(new URL(`/dashboard/connections?error=linkedin_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
    }
}
