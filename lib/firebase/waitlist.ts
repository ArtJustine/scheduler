import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8",
    authDomain: "socialmedia-scheduler-eb22f.firebaseapp.com",
    projectId: "socialmedia-scheduler-eb22f",
    storageBucket: "socialmedia-scheduler-eb22f.firebasestorage.app",
    messagingSenderId: "974176191059",
    appId: "1:974176191059:web:4b29d837e57c00a97abca6"
}

// Initialize Firebase for server-side use
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

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
