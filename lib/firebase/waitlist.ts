import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { serverDb } from "@/lib/firebase-server"

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
        if (!serverDb) {
            throw new Error("Database not initialized")
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return { success: false, message: "Invalid email format" }
        }

        // Check if email already exists
        const waitlistRef = collection(serverDb, "waitlist")
        const snapshot = await getDocs(waitlistRef)
        const existingEmail = snapshot.docs.find((doc) => doc.data().email === email)

        if (existingEmail) {
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
        if (!serverDb) {
            throw new Error("Database not initialized")
        }

        const waitlistRef = collection(serverDb, "waitlist")
        const q = query(waitlistRef, orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email,
            createdAt: doc.data().createdAt.toDate().toISOString(),
            status: doc.data().status || "pending",
        }))
    } catch (error: any) {
        console.error("Error getting waitlist signups:", error)
        return []
    }
}
