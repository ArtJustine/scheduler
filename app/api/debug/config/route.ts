// Debug endpoint to check configuration
import { NextResponse } from "next/server"

// Disable this debug endpoint in production to avoid leaking configuration
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  return NextResponse.json({ status: "debug-only", environment: process.env.NODE_ENV })
}