import { NextResponse } from "next/server"
import { checkScheduledPosts } from "@/lib/scheduler-service"
import { config } from "@/lib/config"

// Force dynamic rendering — cron routes must never be statically pre-rendered
export const dynamic = "force-dynamic"
// Max 60s on Vercel Hobby plan; upgrade to Pro for longer execution
export const maxDuration = 60

export async function GET(request: Request) {
  try {
    const expected = config.app.cronSecret

    // Vercel Cron sends the secret as: Authorization: Bearer <CRON_SECRET>
    const authHeader = request.headers.get("authorization")
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

    // Also accept a legacy ?secret= query param (for manual/dev invocations)
    const url = new URL(request.url)
    const querySecret = url.searchParams.get("secret")

    const isAuthorized =
      bearerToken === expected ||
      querySecret === expected ||
      // Allow unauthenticated calls in local development when no secret is configured
      (process.env.NODE_ENV !== "production" && !expected)

    if (!isAuthorized) {
      console.warn("Cron: Unauthorized request. Provided bearer:", bearerToken ? "[set]" : "none", "query secret:", querySecret ? "[set]" : "none")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Cron: Starting scheduled post check at", new Date().toISOString())
    await checkScheduledPosts()
    console.log("Cron: Scheduler completed at", new Date().toISOString())
    return NextResponse.json({ success: true, message: "Scheduler ran successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Cron: Error running scheduler:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
