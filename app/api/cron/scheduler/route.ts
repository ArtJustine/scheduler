import { NextResponse } from "next/server"
import { checkScheduledPosts } from "@/lib/scheduler-service"
import { config } from "@/lib/config"

// Force dynamic rendering — cron routes must never be statically pre-rendered
export const dynamic = "force-dynamic"
// Vercel Hobby max is 10s. Pro/Business allows up to 300s.
// Set to 60s as a safe default that works on Pro and is capped to 10s on Hobby.
export const maxDuration = 60

function isAuthorizedRequest(request: Request): boolean {
  const expected = config.app.cronSecret

  // Accept Authorization: Bearer <secret>
  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  // Also accept ?secret= query param (for manual/dashboard invocations)
  const url = new URL(request.url)
  const querySecret = url.searchParams.get("secret")

  return (
    bearerToken === expected ||
    querySecret === expected ||
    // Allow unauthenticated local dev when no secret is configured
    (process.env.NODE_ENV !== "production" && !expected)
  )
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedRequest(request)) {
      console.warn("Cron GET: Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Cron GET: Starting scheduler at", new Date().toISOString())
    await checkScheduledPosts()
    console.log("Cron GET: Scheduler completed at", new Date().toISOString())
    return NextResponse.json({ success: true, message: "Scheduler ran successfully" })
  } catch (error: any) {
    console.error("Cron GET: Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// GitHub Actions can also POST — some curl setups default to POST
export async function POST(request: Request) {
  try {
    if (!isAuthorizedRequest(request)) {
      console.warn("Cron POST: Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Cron POST: Starting scheduler at", new Date().toISOString())
    await checkScheduledPosts()
    console.log("Cron POST: Scheduler completed at", new Date().toISOString())
    return NextResponse.json({ success: true, message: "Scheduler ran successfully" })
  } catch (error: any) {
    console.error("Cron POST: Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
