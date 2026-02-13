// Facebook OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { facebookOAuth, oauthHelpers } from "@/lib/oauth-utils"
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
            console.error("Facebook OAuth error:", error)
            return NextResponse.redirect(new URL(`/dashboard/connections?error=facebook_auth_failed&message=${error}`, request.url))
        }

        // Validate state
        const cookieStore = await cookies()
        const savedState = cookieStore.get("oauth_state")?.value
        const userId = cookieStore.get("oauth_user_id")?.value
        const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

        if (!code || !state || state !== savedState) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_facebook_auth", request.url))
        }

        if (!userId) {
            return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
        }

        // Exchange authorization code for access token
        const tokenData = await facebookOAuth.exchangeCodeForToken(code, storedRedirectUri)

        // Get user info from Facebook
        let fbName = "Facebook User"
        let fbId = null
        let fbPicture = null

        try {
            const fbResponse = await fetch(
                `https://graph.facebook.com/v${config.facebook.apiVersion}/me?fields=id,name,picture&access_token=${tokenData.access_token}`
            )
            if (fbResponse.ok) {
                const fbData = await fbResponse.json()
                fbName = fbData.name
                fbId = fbData.id
                fbPicture = fbData.picture?.data?.url
            }
        } catch (err) {
            console.warn("Could not fetch Facebook user info:", err)
        }

        // Prepare account data for handover
        const accountData = {
            platform: "facebook",
            id: fbId || userId,
            username: fbName,
            profileImage: fbPicture,
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
                    console.log("Facebook account saved to Workspace:", workspaceId)
                } else {
                    const userDocRef = doc(serverDb, "users", userId)
                    await setDoc(userDocRef, {
                        facebook: {
                            ...accountData,
                            updatedAt: new Date().toISOString()
                        }
                    }, { merge: true })
                    console.log("Facebook account saved to User Doc:", userId)
                }
            }
        } catch (saveError) {
            console.error("Error saving Facebook account to Firestore:", saveError)
        }

        // Redirect to dashboard with handover flag
        const response = NextResponse.redirect(new URL("/dashboard/connections?success=facebook_connected&handover=true", request.url))

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
        console.error("Facebook callback error:", error)
        return NextResponse.redirect(new URL(`/dashboard/connections?error=facebook_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
    }
}
