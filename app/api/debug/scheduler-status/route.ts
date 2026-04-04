import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

// Safe diagnostic endpoint — read-only, no mutations
// Visit: /api/debug/scheduler-status (only accessible if CRON_SECRET matches or in dev)
export async function GET(request: Request) {
  // Only allow in dev OR with the cron secret
  const url = new URL(request.url)
  const secret = url.searchParams.get("secret")
  const expected = process.env.CRON_SECRET || ""

  const isAllowed =
    process.env.NODE_ENV !== "production" ||
    (expected && secret === expected)

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasCronSecret: !!process.env.CRON_SECRET,
      hasFirebaseProjectId: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
      hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    },
    firebase: { status: "unknown", scheduledPostCount: null, error: null },
  }

  try {
    if (!adminDb) {
      result.firebase.status = "adminDb is null — Firebase Admin not initialized"
    } else {
      const snapshot = await adminDb
        .collection("posts")
        .where("status", "==", "scheduled")
        .get()

      result.firebase.status = "connected"
      result.firebase.scheduledPostCount = snapshot.size

      // Show the first few due posts for debugging
      const now = new Date().toISOString()
      const duePosts = snapshot.docs
        .map(doc => ({ id: doc.id, scheduledFor: doc.data().scheduledFor, userId: doc.data().userId }))
        .filter(p => p.scheduledFor <= now)

      result.firebase.nowUtc = now
      result.firebase.duePostCount = duePosts.length
      result.firebase.duePosts = duePosts.slice(0, 5) // show max 5
    }
  } catch (error: any) {
    result.firebase.status = "error"
    result.firebase.error = error.message || String(error)
  }

  return NextResponse.json(result, { status: 200 })
}
