import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// In Next.js 15, params MUST be a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  // You MUST await the params
  const { platform } = await params
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // In Next.js 15, cookies() MUST be awaited
  const cookieStore = await cookies()
  const savedState = cookieStore.get("oauth_state")?.value

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=invalid_state&platform=${platform}`, request.url),
    )
  }

  try {
    const mockUsername = `user_${Math.floor(Math.random() * 10000)}`

    // Use the awaited cookieStore
    cookieStore.set(`${platform}_access_token`, "mock_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    })

    return NextResponse.redirect(
      new URL(
        `/dashboard/connections?success=true&platform=${platform}&username=${mockUsername}`,
        request.url,
      ),
    )
  } catch (err) {
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=failed&platform=${platform}`, request.url),
    )
  }
}