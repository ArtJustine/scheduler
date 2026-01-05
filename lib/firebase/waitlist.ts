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
        const waitlistRef = collection(db, "waitlist")
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
