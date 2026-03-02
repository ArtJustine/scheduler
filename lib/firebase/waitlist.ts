import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase for server-side and client-side use
let app;
let db: any;

try {
    if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        if (!getApps().length) {
            if (firebaseConfig.apiKey) {
                app = initializeApp(firebaseConfig)
            }
        } else {
            app = getApps()[0]
        }

        if (app) {
            db = getFirestore(app)
        }
    }
} catch (error) {
    console.error("Firebase waitlist initialization failed:", error)
}

export interface WaitlistEntry {
    id?: string
    email: string
    createdAt: string
    status: "pending" | "invited" | "joined"
}

/**
 * Add an email to the waitlist
 */
export async function addToWaitlist(email: string): Promise<{ success: boolean; message: string }> {
    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return { success: false, message: "Invalid email format" }
        }

        // Check if email already exists
        const waitlistRef = collection(db, "waitlist")
        const normalizedEmail = email.toLowerCase().trim()

        const { query, where, getDocs: getDocsQuery } = await import("firebase/firestore")
        const q = query(waitlistRef, where("email", "==", normalizedEmail))
        const snapshot = await getDocsQuery(q)

        if (!snapshot.empty) {
            return { success: false, message: "This email is already on the waitlist" }
        }

        // Add to waitlist
        await addDoc(waitlistRef, {
            email: email.toLowerCase().trim(),
            createdAt: Timestamp.now(),
            status: "pending",
        })

        return { success: true, message: "Successfully added to waitlist" }
    } catch (error: any) {
        console.error("Error adding to waitlist:", error)
        return { success: false, message: "Failed to add to waitlist. Please try again." }
    }
}

/**
 * Get all waitlist entries (admin only)
 */
export async function getWaitlistSignups(): Promise<WaitlistEntry[]> {
    try {
        const waitlistRef = collection(db, "waitlist")
        // Try to get docs. We'll sort them in memory to avoid index requirements
        const snapshot = await getDocs(waitlistRef)

        const signups = snapshot.docs.map((doc) => {
            const data = doc.data()
            let createdAt = new Date().toISOString()

            if (data.createdAt) {
                try {
                    createdAt = typeof data.createdAt.toDate === 'function'
                        ? data.createdAt.toDate().toISOString()
                        : new Date(data.createdAt).toISOString()
                } catch (e) {
                    console.warn(`Invalid date for doc ${doc.id}:`, data.createdAt)
                }
            }

            return {
                id: doc.id,
                email: data.email || "",
                createdAt: createdAt,
                status: data.status || "pending",
            } as WaitlistEntry
        })

        // Sort by date descending in memory
        return signups.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    } catch (error: any) {
        console.error("Error getting waitlist signups:", error)
        return []
    }
}
