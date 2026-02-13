// LinkedIn OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { linkedinOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        // Check if LinkedIn is configured
        if (!isPlatformConfigured("linkedin")) {
            return NextResponse.json(
                { error: "LinkedIn API is not configured" },
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
        let redirectUri = config.linkedin.redirectUri

        // In development environments that aren't production
        if (process.env.NODE_ENV !== "production" && request.nextUrl.origin.includes("localhost")) {
            redirectUri = `${request.nextUrl.origin}/api/auth/callback/linkedin`
        }

        console.log("LinkedIn OAuth Redirect URI being used:", redirectUri)

        // Build LinkedIn OAuth URL
        const linkedinAuthUrl = linkedinOAuth.getAuthUrl(state, redirectUri)

        // Store state, userId, and redirectUri in cookies
        const response = NextResponse.redirect(linkedinAuthUrl)

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
        console.error("LinkedIn auth error:", error)
        return NextResponse.json(
            { error: "Failed to initiate LinkedIn authentication" },
            { status: 500 }
        )
    }
}
