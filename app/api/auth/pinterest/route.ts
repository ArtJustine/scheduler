// Pinterest OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { pinterestOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        // Check if Pinterest is configured
        if (!isPlatformConfigured("pinterest")) {
            return NextResponse.json(
                { error: "Pinterest API is not configured" },
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

        // Determine the host for dynamic redirect URI
        let redirectUri = config.pinterest.redirectUri

        // In development environments that aren't production
        if (process.env.NODE_ENV !== "production" && request.nextUrl.origin.includes("localhost")) {
            redirectUri = `${request.nextUrl.origin}/api/auth/callback/pinterest`
        }

        console.log("Pinterest OAuth Redirect URI being used:", redirectUri)

        // Build Pinterest OAuth URL
        const pinterestAuthUrl = pinterestOAuth.getAuthUrl(state, redirectUri)

        // Store state, userId, and redirectUri in cookies
        const response = NextResponse.redirect(pinterestAuthUrl)

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
        console.error("Pinterest auth error:", error)
        return NextResponse.json(
            { error: "Failed to initiate Pinterest authentication" },
            { status: 500 }
        )
    }
}
