// Facebook OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
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

        // Get user ID from query params or cookie
        const userId = request.nextUrl.searchParams.get("userId") || (await cookies()).get("userId")?.value

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        // Generate a unique state parameter for security
        const state = oauthHelpers.generateState()

        // Determine the host for dynamic redirect URI
        let redirectUri = config.facebook.redirectUri

        // In development environments that aren't production, we might want to use the request origin
        if (process.env.NODE_ENV !== "production" && request.nextUrl.origin.includes("localhost")) {
            redirectUri = `${request.nextUrl.origin}/api/auth/callback/facebook`
        }

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

        return response
    } catch (error) {
        console.error("Facebook auth error:", error)
        return NextResponse.json(
            { error: "Failed to initiate Facebook authentication" },
            { status: 500 }
        )
    }
}
