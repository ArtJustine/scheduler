import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
    accounts?: Record<string, any>;
}

interface WorkspaceContextType {
    activeWorkspace: Workspace | null;
    workspaces: Workspace[];
    loading: boolean;
    switchWorkspace: (workspaceId: string) => Promise<void>;
    refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
    activeWorkspace: null,
    workspaces: [],
    loading: true,
    switchWorkspace: async () => { },
    refreshWorkspaces: async () => { },
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshWorkspaces = async () => {
        if (!user) {
            setWorkspaces([]);
            setActiveWorkspace(null);
            setLoading(false);
            return;
        }

        try {
            // Get all workspaces user is a member of
            const snapshot = await db.collection('workspaces')
                .where('memberIds', 'array-contains', user.uid)
                .get();

            const workspaceList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Workspace));

            setWorkspaces(workspaceList);

            // Get active workspace ID from user document
            const userDoc = await db.collection('users').doc(user.uid).get();
            let activeId = userDoc.exists ? userDoc.data()?.activeWorkspaceId : null;

            if (!activeId && workspaceList.length > 0) {
                activeId = workspaceList[0].id;
                await db.collection('users').doc(user.uid).set({ activeWorkspaceId: activeId }, { merge: true });
            }

            if (activeId) {
                const active = workspaceList.find(w => w.id === activeId);
                if (active) {
                    setActiveWorkspace(active);
                } else if (workspaceList.length > 0) {
                    setActiveWorkspace(workspaceList[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshWorkspaces();
    }, [user]);

    const switchWorkspace = async (workspaceId: string) => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).set({ activeWorkspaceId: workspaceId }, { merge: true });
            const selected = workspaces.find(w => w.id === workspaceId);
            if (selected) {
                setActiveWorkspace(selected);
            }
        } catch (error) {
            console.error('Error switching workspace:', error);
        }
    };

    return (
        <WorkspaceContext.Provider value={{ activeWorkspace, workspaces, loading, switchWorkspace, refreshWorkspaces }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export const useWorkspace = () => useContext(WorkspaceContext);
