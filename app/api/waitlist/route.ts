import { NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for development
// In production, this will use Firestore via the client-side
const waitlistEmails: Array<{ email: string; createdAt: string }> = []

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
        }

        // For now, we'll use a simpler approach - save to Firestore from client-side
        // This API route just validates and returns success
        // The actual saving will happen via client-side Firebase

        return NextResponse.json(
            { success: true, message: "Successfully added to waitlist" },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Waitlist API error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
