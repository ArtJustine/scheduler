import { db } from "./config";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";

export interface HelpRequest {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: Timestamp;
    status: 'new' | 'read' | 'replied';
}

export async function submitHelpRequest(data: { name: string; email: string; subject: string; message: string }) {
    if (!db) throw new Error("Firestore database not initialized");
    try {
        const docRef = await addDoc(collection(db, "help_requests"), {
            ...data,
            status: 'new',
            createdAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error submitting help request:", error);
        throw error;
    }
}

export async function getHelpRequests() {
    if (!db) throw new Error("Firestore database not initialized");
    try {
        const q = query(collection(db, "help_requests"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as HelpRequest[];
    } catch (error) {
        console.error("Error fetching help requests:", error);
        throw error;
    }
}
