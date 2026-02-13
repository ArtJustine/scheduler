// LinkedIn OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { linkedinOAuth, oauthHelpers } from "@/lib/oauth-utils"
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
            // Trying the newest userinfo endpoint (OpenID Connect)
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
                lnName = lnData.name || `${lnData.given_name} ${lnData.family_name}`
                lnId = lnData.sub
                lnPicture = lnData.picture
            } else {
                // Fallback to older me endpoint
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
                    lnName = `${meData.localizedFirstName} ${meData.localizedLastName}`
                    lnId = meData.id
                }
            }
        } catch (err) {
            console.warn("Could not fetch LinkedIn user info:", err)
        }

        // Prepare account data for handover
        const accountData = {
            platform: "linkedin",
            id: lnId || userId,
            username: lnName,
            profileImage: lnPicture,
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
                    console.log("LinkedIn account saved to Workspace:", workspaceId)
                } else {
                    const userDocRef = doc(serverDb, "users", userId)
                    await setDoc(userDocRef, {
                        linkedin: {
                            ...accountData,
                            updatedAt: new Date().toISOString()
                        }
                    }, { merge: true })
                    console.log("LinkedIn account saved to User Doc:", userId)
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
