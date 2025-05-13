import { type NextRequest, NextResponse } from "next/server"
import { checkScheduledPosts } from "@/lib/scheduler-service"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Run the scheduler
    await checkScheduledPosts()

    return NextResponse.json({
      success: true,
      message: "Scheduler ran successfully",
    })
  } catch (error) {
    console.error("Error running scheduler:", error)

    return NextResponse.json({ error: "Failed to run scheduler" }, { status: 500 })
  }
}
