import { NextRequest, NextResponse } from "next/server"
import { fetchThreadsStats } from "@/lib/threads-service"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, username, threadsId } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 })
    }

    const stats = await fetchThreadsStats(accessToken, threadsId, username)

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("Threads followers route error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch Threads followers" },
      { status: 500 }
    )
  }
}
