import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    // Basic hardening for production
    if (process.env.NODE_ENV === "production") {
      // Enforce HTTPS
      const proto = request.headers.get("x-forwarded-proto")
      const host = request.headers.get("host")
      if (proto === "http" && host) {
        const url = new URL(request.url)
        url.protocol = "https:"
        return NextResponse.redirect(url)
      }
    }
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
