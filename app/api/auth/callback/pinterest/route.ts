// Pinterest OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { pinterestOAuth, oauthHelpers } from "@/lib/oauth-utils"
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
            console.error("Pinterest OAuth error:", error)
            return NextResponse.redirect(new URL(`/dashboard/connections?error=pinterest_auth_failed&message=${error}`, request.url))
        }

        // Validate state
        const cookieStore = await cookies()
        const savedState = cookieStore.get("oauth_state")?.value
        const userId = cookieStore.get("oauth_user_id")?.value
        const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

        if (!code || !state || state !== savedState) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_pinterest_auth", request.url))
        }

        if (!userId) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
        }

        // Exchange authorization code for access token
        const tokenData = await pinterestOAuth.exchangeCodeForToken(code, storedRedirectUri)

        // Get user info from Pinterest
        let pinName = "Pinterest User"
        let pinId = null
        let pinPicture = null

        try {
            const pinResponse = await fetch(
                "https://api.pinterest.com/v5/user_account",
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                }
            )
            if (pinResponse.ok) {
                const pinData = await pinResponse.json()
                pinName = pinData.username
                pinId = pinData.username // Pinterest V5 uses username as identifier usually or id
                pinPicture = pinData.profile_image
            }
        } catch (err) {
            console.warn("Could not fetch Pinterest user info:", err)
        }

        // Prepare account data for handover
        const accountData = {
            platform: "pinterest",
            id: pinId || userId,
            username: pinName,
            profileImage: pinPicture,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                : null,
            connectedAt: new Date().toISOString(),
            connected: true,
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
                    console.log("Pinterest account saved to Workspace:", workspaceId)
                } else {
                    const userDocRef = doc(serverDb, "users", userId)
                    await setDoc(userDocRef, {
                        pinterest: {
                            ...accountData,
                            updatedAt: new Date().toISOString()
                        }
                    }, { merge: true })
                    console.log("Pinterest account saved to User Doc:", userId)
                }
            }
        } catch (saveError) {
            console.error("Error saving Pinterest account to Firestore:", saveError)
        }

        // Redirect to dashboard with handover flag
        const response = NextResponse.redirect(new URL("/dashboard/connections?success=pinterest_connected&handover=true", request.url))

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
        console.error("Pinterest callback error:", error)
        return NextResponse.redirect(new URL(`/dashboard/connections?error=pinterest_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
    }
}
