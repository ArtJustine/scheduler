
import * as admin from "firebase-admin"

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

export function getFirebaseAdmin() {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            })
        } else {
            // Fallback for local development if emulators are running or default creds exist
            admin.initializeApp({
                projectId: firebaseAdminConfig.projectId,
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

export const { adminDb, adminStorage, adminAuth } = getFirebaseAdmin()
