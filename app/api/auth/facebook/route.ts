// Facebook OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { isPlatformConfigured } from "@/lib/config"
import { facebookOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        // Check if Facebook is configured
        if (!isPlatformConfigured("facebook")) {
            return NextResponse.json(
                { error: "Facebook API is not configured" },
                { status: 500 }
            )
        }

        // Get user ID and workspace ID from query params
        const userId = request.nextUrl.searchParams.get("userId") || (await cookies()).get("userId")?.value
        const workspaceId = request.nextUrl.searchParams.get("workspaceId")

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        // Generate a unique state parameter for security
        const state = oauthHelpers.generateState()

        // Always use the live request origin to avoid stale domain/config mismatches.
        const redirectUri = `${request.nextUrl.origin}/api/auth/callback/facebook`

        console.log("Facebook OAuth Redirect URI being used:", redirectUri)

        // Build Facebook OAuth URL
        const facebookAuthUrl = facebookOAuth.getAuthUrl(state, redirectUri)

        // Store state, userId, and redirectUri in cookies
        const response = NextResponse.redirect(facebookAuthUrl)
        const cookieStore = await cookies()

        response.cookies.set("oauth_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 600,
            sameSite: "lax",
        })
        response.cookies.set("oauth_user_id", userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 600,
            sameSite: "lax",
        })
        response.cookies.set("oauth_redirect_uri", redirectUri, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 600,
            sameSite: "lax",
        })

        if (workspaceId) {
            response.cookies.set("oauth_workspace_id", workspaceId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 600,
                sameSite: "lax",
            })
        }

        return response
    } catch (error) {
        console.error("Facebook auth error:", error)
        return NextResponse.json(
            { error: "Failed to initiate Facebook authentication" },
            { status: 500 }
        )
    }
}
