import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    // For now, just pass through all requests
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, still allow the request to proceed
    return NextResponse.next()
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
