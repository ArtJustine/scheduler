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
    deleteDoc,
    serverTimestamp
} from "firebase/firestore"
import { Workspace, WorkspaceSettings } from "@/types/workspace"

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
        accounts: {},
        settings: {
            niche: "",
            trendCompetitors: [],
            notifications: {
                email: true,
                postReminders: true,
                analyticsUpdates: false,
            },
        },
    }

    const docRef = await addDoc(workspacesRef, newWorkspace)

    // Automatically enter the newly created workspace
    const userRef = doc(firebaseDb!, "users", userId)
    await setDoc(userRef, { activeWorkspaceId: docRef.id }, { merge: true })

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
            return null
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

export async function deleteWorkspace(workspaceId: string) {
    const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
    await deleteDoc(workspaceRef)
}

export async function getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
    const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
    const workspaceDoc = await getDoc(workspaceRef)
    if (workspaceDoc.exists()) {
        return (workspaceDoc.data().settings as WorkspaceSettings) || {}
    }
    return {}
}

export async function updateWorkspaceSettings(workspaceId: string, settings: Partial<WorkspaceSettings>) {
    const workspaceRef = doc(firebaseDb!, "workspaces", workspaceId)
    // Use dot-notation updates to merge nested settings fields
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (settings.niche !== undefined) updates["settings.niche"] = settings.niche
    if (settings.trendCompetitors !== undefined) updates["settings.trendCompetitors"] = settings.trendCompetitors
    if (settings.notifications !== undefined) {
        if (settings.notifications.email !== undefined) updates["settings.notifications.email"] = settings.notifications.email
        if (settings.notifications.postReminders !== undefined) updates["settings.notifications.postReminders"] = settings.notifications.postReminders
        if (settings.notifications.analyticsUpdates !== undefined) updates["settings.notifications.analyticsUpdates"] = settings.notifications.analyticsUpdates
    }
    await updateDoc(workspaceRef, updates)
}
