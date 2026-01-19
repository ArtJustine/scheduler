// Debug endpoint to check configuration
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"

// Disable this debug endpoint in production to avoid leaking configuration
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !request.nextUrl.searchParams.has("force")) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const origin = request.nextUrl.origin

  return NextResponse.json({
    status: "debug",
    environment: process.env.NODE_ENV,
    origin: origin,
    config: {
      youtube: {
        clientId: config.youtube.clientId ? `${config.youtube.clientId.substring(0, 10)}...` : "not set",
        configuredRedirectUri: config.youtube.redirectUri,
        calculatedRedirectUri: `${origin}/api/auth/callback/youtube`,
        hasClientSecret: !!config.youtube.clientSecret,
      },
      tiktok: {
        clientKey: config.tiktok.clientKey,
        calculatedRedirectUri: `${origin}/api/auth/callback/tiktok`,
      },
      instagram: {
        appId: config.instagram.appId,
        calculatedRedirectUri: `${origin}/api/auth/callback/instagram`,
      }
    },
    instructions: "Ensure the 'calculatedRedirectUri' matches exactly what is configured in your platform's developer console."
  })
}