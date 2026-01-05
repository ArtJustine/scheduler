import { NextRequest, NextResponse } from "next/server"
import { addToWaitlist } from "@/lib/firebase/waitlist"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
        }

        const result = await addToWaitlist(email)

        if (result.success) {
            return NextResponse.json(result, { status: 200 })
        } else {
            return NextResponse.json(result, { status: 400 })
        }
    } catch (error: any) {
        console.error("Waitlist API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
