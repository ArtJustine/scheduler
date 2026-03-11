import { firebaseDb as db } from "../firebase-client"
import { collection, doc, getDoc, getDocs, setDoc, query, where, serverTimestamp } from "firebase/firestore"

export interface BioLink {
    id: string
    title: string
    url: string
    enabled: boolean
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

export const getPublicBioProfile = async (username: string): Promise<BioProfile | null> => {
    try {
        if (!db) throw new Error("Database not initialized")
        const profilesRef = collection(db, "bio_profiles")
        const q = query(profilesRef, where("username", "==", username))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
            return {
                ...querySnapshot.docs[0].data(),
                userId: querySnapshot.docs[0].id
            } as BioProfile
        }
        return null
    } catch (error) {
        console.error("Error getting public bio profile:", error)
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
        
        // Ensure we don't overwrite createdAt if treating this as an update.
        // setDoc with merge: true handles this gracefully.
        await setDoc(docRef, dataToSave, { merge: true })
    } catch (error) {
        console.error("Error saving bio profile:", error)
        throw error
    }
}
