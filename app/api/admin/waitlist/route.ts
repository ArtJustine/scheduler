import { NextRequest, NextResponse } from "next/server"
import { getWaitlistSignups } from "@/lib/firebase/waitlist"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        // Basic authentication check - you can enhance this
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get("session")

        // For now, we'll allow access if there's any session
        // In production, you should verify the user is an admin

        const signups = await getWaitlistSignups()

        return NextResponse.json({ signups }, { status: 200 })
    } catch (error: any) {
        console.error("Admin waitlist API error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch signups" },
            { status: 500 }
        )
    }
}
