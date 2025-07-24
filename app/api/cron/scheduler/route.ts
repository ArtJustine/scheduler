// This file is commented out for UI development
// Will be implemented later when integrating with the backend

import { NextResponse } from "next/server"
import { checkScheduledPosts } from "@/lib/scheduler-service"

export async function GET(request: Request) {
  try {
    await checkScheduledPosts()
    return NextResponse.json({ success: true, message: "Scheduler ran successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error running scheduler:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
