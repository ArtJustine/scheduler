
import * as admin from "firebase-admin"

export function getFirebaseAdmin() {
    if (!admin.apps.length) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

        // If we have a private key, try to use the service account cert
        if (privateKey && clientEmail && projectId) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        project_id: projectId,
                        client_email: clientEmail,
                        private_key: privateKey,
                    } as any),
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                })
                console.log("Firebase Admin initialized with service account")
            } catch (error) {
                console.error("Firebase Admin service account init failed, falling back:", error)
                admin.initializeApp({
                    projectId: projectId,
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                })
            }
        } else {
            // Fallback for local development or missing service account credentials
            admin.initializeApp({
                projectId: projectId || "socialmedia-scheduler-eb22f",
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            })
        }
    }

    return {
        adminDb: admin.firestore(),
        adminStorage: admin.storage(),
        adminAuth: admin.auth(),
    }
}

// Execute safely at top level
const adminInstance = getFirebaseAdmin()
export const adminDb = adminInstance.adminDb
export const adminStorage = adminInstance.adminStorage
export const adminAuth = adminInstance.adminAuth
