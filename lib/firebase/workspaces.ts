import { firebaseDb } from "../firebase-client"
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore"
import { Workspace } from "@/types/workspace"

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const workspacesRef = collection(firebaseDb!, "workspaces")
    const q = query(workspacesRef, where("memberIds", "array-contains", userId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Workspace))
}

export async function createWorkspace(userId: string, name: string): Promise<string> {
    const workspacesRef = collection(firebaseDb!, "workspaces")
    const newWorkspace = {
        name,
        ownerId: userId,
        memberIds: [userId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accounts: {}
    }

    const docRef = await addDoc(workspacesRef, newWorkspace)

    // Update user doc with this as active workspace if they don't have one
    const userRef = doc(firebaseDb!, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists() || !userDoc.data().activeWorkspaceId) {
        await setDoc(userRef, { activeWorkspaceId: docRef.id }, { merge: true })
    }

    return docRef.id
}

export async function getActiveWorkspace(userId: string): Promise<Workspace | null> {
    const userRef = doc(firebaseDb!, "users", userId)
    const userDoc = await getDoc(userRef)

    let workspaceId = userDoc.exists() ? userDoc.data().activeWorkspaceId : null

    if (!workspaceId) {
        // Check if they have any workspaces
        const workspaces = await getUserWorkspaces(userId)
        if (workspaces.length > 0) {
            workspaceId = workspaces[0].id
            await setDoc(userRef, { activeWorkspaceId: workspaceId }, { merge: true })
        } else {
            // Create a default one
            workspaceId = await createWorkspace(userId, "Default Brand")
        }
    }

    const workspaceDoc = await getDoc(doc(firebaseDb!, "workspaces", workspaceId))
    if (workspaceDoc.exists()) {
        return { id: workspaceDoc.id, ...workspaceDoc.data() } as Workspace
    }

    return null
}

export async function setActiveWorkspace(userId: string, workspaceId: string) {
    const userRef = doc(firebaseDb!, "users", userId)
    await setDoc(userRef, { activeWorkspaceId: workspaceId }, { merge: true })
}
