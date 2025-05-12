import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/signup" || path === "/"

  // Get the token from the cookies
  const token = request.cookies.get("session")?.value

  // If the path requires authentication and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is authenticated and tries to access login or signup, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Match all paths except for static files, api routes, and _next
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
