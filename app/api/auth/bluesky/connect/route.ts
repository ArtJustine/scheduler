import { NextRequest, NextResponse } from "next/server"
import { loginBluesky } from "@/lib/bluesky-service"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { identifier, appPassword, userId, workspaceId } = body

        if (!identifier || !appPassword || !userId) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            )
        }

        // 1. Verify credentials with Bluesky
        const result = await loginBluesky(identifier, appPassword)

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 401 }
            )
        }

        // 2. Prepare account data
        const accountData = {
            platform: "bluesky",
            id: result.did,
            username: result.handle,
            displayName: result.displayName,
            profileImage: result.avatar,
            followers: result.followersCount,
            posts: result.postsCount,
            accessToken: appPassword, // We store the app password as "access token" for Bluesky
            identifier: identifier,
            connectedAt: new Date().toISOString(),
            connected: true,
            updatedAt: new Date().toISOString()
        }

        // 3. Save to Firestore using Admin SDK to bypass rules
        if (adminDb) {
            const timestamp = new Date().toISOString()
            if (workspaceId) {
                const workspaceRef = adminDb.collection("workspaces").doc(workspaceId)
                await workspaceRef.set({
                    accounts: {
                        bluesky: accountData
                    },
                    updatedAt: timestamp
                }, { merge: true })
                console.log(`Bluesky account (${result.handle}) saved to Workspace:`, workspaceId)
            } else {
                const userRef = adminDb.collection("users").doc(userId)
                await userRef.set({
                    bluesky: accountData,
                    updatedAt: timestamp
                }, { merge: true })
                console.log(`Bluesky account (${result.handle}) saved to User Doc:`, userId)
            }
        } else {
            console.warn("Firestore adminDb not available")
            return NextResponse.json(
                { success: false, error: "Database connection failed" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Bluesky connect API error:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
