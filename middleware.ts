import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simplified middleware that doesn't actually check authentication
  // since we can't access Firebase auth in middleware
  // Instead, we'll rely on client-side redirects in the dashboard layout

  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/signup" || path === "/"

  // For dashboard paths, we'll let the client-side auth check handle it
  // This is just to prevent unnecessary server-side rendering
  if (!isPublicPath) {
    // We'll let the client handle the actual auth check
    return NextResponse.next()
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
