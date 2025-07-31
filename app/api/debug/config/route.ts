// Debug endpoint to check configuration
import { NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"

export async function GET() {
  return NextResponse.json({
    tiktok: {
      clientKey: config.tiktok.clientKey,
      clientSecret: config.tiktok.clientSecret,
      redirectUri: config.tiktok.redirectUri,
      isConfigured: isPlatformConfigured("tiktok"),
    },
    youtube: {
      clientId: config.youtube.clientId,
      clientSecret: config.youtube.clientSecret,
      redirectUri: config.youtube.redirectUri,
      isConfigured: isPlatformConfigured("youtube"),
    },
    environment: process.env.NODE_ENV,
    hasEnvVars: {
      TIKTOK_CLIENT_KEY: !!process.env.TIKTOK_CLIENT_KEY,
      TIKTOK_CLIENT_SECRET: !!process.env.TIKTOK_CLIENT_SECRET,
      YOUTUBE_CLIENT_ID: !!process.env.YOUTUBE_CLIENT_ID,
      YOUTUBE_CLIENT_SECRET: !!process.env.YOUTUBE_CLIENT_SECRET,
    }
  })
} 