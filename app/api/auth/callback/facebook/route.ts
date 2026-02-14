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

                // Fetch linked Instagram Business Accounts from Facebook Pages
                try {
                    console.log("Checking for linked Instagram Business accounts...")
                    const pagesResponse = await fetch(
                        `https://graph.facebook.com/v${config.facebook.apiVersion}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}&access_token=${tokenData.access_token}`
                    )

                    if (pagesResponse.ok) {
                        const pagesData = await pagesResponse.json()
                        console.log("Found Pages:", pagesData.data?.length || 0)

                        for (const page of (pagesData.data || [])) {
                            if (page.instagram_business_account) {
                                const ig = page.instagram_business_account
                                const igAccountData = {
                                    platform: "instagram",
                                    id: ig.id,
                                    username: ig.username,
                                    name: ig.name,
                                    profileImage: ig.profile_picture_url,
                                    followers: Number(ig.followers_count ?? ig.follower_count) || 0,
                                    posts: Number(ig.media_count) || 0,
                                    accessToken: page.access_token, // Page token can often act on behalf of IG
                                    connected: true,
                                    connectedAt: new Date().toISOString(),
                                    pageId: page.id,
                                    pageName: page.name
                                }

                                if (workspaceId) {
                                    const workspaceDocRef = doc(serverDb, "workspaces", workspaceId)
                                    await updateDoc(workspaceDocRef, {
                                        [`accounts.instagram`]: {
                                            ...igAccountData,
                                            updatedAt: new Date().toISOString()
                                        }
                                    } as any)
                                    console.log("Linked Instagram account saved to Workspace:", workspaceId)
                                }
                            }
                        }
                    }
                } catch (igErr) {
                    console.warn("Could not fetch linked Instagram accounts:", igErr)
                }

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

        // Redirect to dashboard with handover flag and smart success message
        const isInstagramInitiated = cookieStore.get("oauth_redirect_uri")?.value?.includes("instagram")
        let successType = isInstagramInitiated ? "instagram_connected" : "facebook_connected"

        try {
            const workspaceId = cookieStore.get("oauth_workspace_id")?.value
            if (workspaceId && serverDb) {
                const { getDoc } = await import("firebase/firestore")
                const workspaceDoc = await getDoc(doc(serverDb, "workspaces", workspaceId))
                if (workspaceDoc.exists()) {
                    const data = workspaceDoc.data()
                    if (data.accounts?.instagram?.connected && data.accounts?.facebook?.connected) {
                        successType = "facebook_instagram_connected"
                    } else if (data.accounts?.instagram?.connected && isInstagramInitiated) {
                        successType = "instagram_connected"
                    }
                }
            }
        } catch (e) { console.warn("Could not determine detailed success message:", e) }

        const response = NextResponse.redirect(new URL(`/dashboard/connections?success=${successType}&handover=true`, request.url))

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
