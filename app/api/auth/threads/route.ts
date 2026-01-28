// Threads OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { threadsOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        // Check if Threads is configured
        if (!isPlatformConfigured("threads")) {
            return NextResponse.json(
                { error: "Threads API is not configured" },
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
        let redirectUri = config.threads.redirectUri

        // In development environments that aren't production
        if (process.env.NODE_ENV !== "production" && request.nextUrl.origin.includes("localhost")) {
            redirectUri = `${request.nextUrl.origin}/api/auth/callback/threads`
        }

        console.log("Threads OAuth Redirect URI being used:", redirectUri)

        // Build Threads OAuth URL
        const threadsAuthUrl = threadsOAuth.getAuthUrl(state, redirectUri)

        // Store state, userId, and redirectUri in cookies
        const response = NextResponse.redirect(threadsAuthUrl)

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
        console.error("Threads auth error:", error)
        return NextResponse.json(
            { error: "Failed to initiate Threads authentication" },
            { status: 500 }
        )
    }
}
