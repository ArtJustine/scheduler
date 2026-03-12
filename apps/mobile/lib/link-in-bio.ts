import { db } from "./firebase"
import { collection, doc, getDoc, getDocs, setDoc, query, where, serverTimestamp } from "firebase/firestore"

export interface BioLink {
    id: string
    title: string
    url: string
    enabled: boolean
    type?: 'link' | 'heading' | 'subheading' | 'social'
    platform?: string
    fontFamily?: string
    fontColor?: string
    backgroundColor?: string
    layout?: string
}

export interface BioProfile {
    userId: string
    username: string
    displayName: string
    bio: string
    theme: string
    profileImage: string | null
    links: BioLink[]
    createdAt?: any
    updatedAt?: any
}

export const getUserBioProfile = async (userId: string): Promise<BioProfile | null> => {
    try {
        if (!db) throw new Error("Database not initialized")
        const docRef = doc(db, "bio_profiles", userId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
            return {
                ...docSnap.data(),
                userId: docSnap.id
            } as BioProfile
        }
        return null
    } catch (error) {
        console.error("Error getting user bio profile:", error)
        throw error
    }
}

export const isUsernameAvailable = async (username: string, currentUserId: string): Promise<boolean> => {
    try {
        if (!db) throw new Error("Database not initialized")
        const q = query(collection(db, "bio_profiles"), where("username", "==", username))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
            return true
        }
        
        return querySnapshot.docs[0].id === currentUserId
    } catch (error) {
        console.error("Error checking username availability:", error)
        throw error
    }
}

export const saveBioProfile = async (userId: string, profileData: Partial<BioProfile>): Promise<void> => {
    try {
        if (!db) throw new Error("Database not initialized")
        const docRef = doc(db, "bio_profiles", userId)
        
        const dataToSave = {
            ...profileData,
            userId,
            updatedAt: serverTimestamp()
        }
        
        await setDoc(docRef, dataToSave, { merge: true })
    } catch (error) {
        console.error("Error saving bio profile:", error)
        throw error
    }
}
