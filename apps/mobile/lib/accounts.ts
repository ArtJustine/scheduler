/**
 * Chiyu Social — Social Accounts service (React Native)
 * ────────────────────────────────────────────────────────
 * Handles fetching connected social media accounts.
 */

import { db, auth } from './firebase';
import { SocialAccount, SocialAccountType } from '@/types';

/**
 * Fetch the active workspace for the current user
 */
export const getActiveWorkspace = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
        // 1. Get user's active workspace ID
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        let workspaceId = userDoc.exists ? userDoc.data()?.activeWorkspaceId : null;

        // 2. If no active ID, fetch the first workspace they are a member of
        if (!workspaceId) {
            const workspacesSnapshot = await db
                .collection('workspaces')
                .where('memberIds', 'array-contains', currentUser.uid)
                .limit(1)
                .get();

            if (workspacesSnapshot.empty) return null;

            workspaceId = workspacesSnapshot.docs[0].id;
            // Save it back to user profile for next time
            await db.collection('users').doc(currentUser.uid).set({ activeWorkspaceId: workspaceId }, { merge: true });
        }

        // 3. Fetch the workspace data
        const workspaceDoc = await db.collection('workspaces').doc(workspaceId).get();
        if (!workspaceDoc.exists) return null;

        return { id: workspaceDoc.id, ...workspaceDoc.data() };
    } catch (error) {
        console.error('[accounts] getActiveWorkspace error:', error);
        return null;
    }
};

/**
 * Fetch all connected social accounts
 */
export const getConnectedAccounts = async (): Promise<Partial<Record<SocialAccountType, SocialAccount>>> => {
    try {
        const workspace = await getActiveWorkspace();
        if (!workspace || !workspace.accounts) return {};

        const accounts = workspace.accounts as Record<string, any>;
        const normalized: Partial<Record<SocialAccountType, SocialAccount>> = {};

        Object.keys(accounts).forEach((key) => {
            const acc = accounts[key];
            normalized[key as SocialAccountType] = {
                ...acc,
                username: acc.username || acc.name || acc.display_name || 'User',
                connected: Boolean(acc.connected || acc.accessToken || acc.access_token),
            };
        });

        return normalized;
    } catch (error) {
        console.error('[accounts] getConnectedAccounts error:', error);
        return {};
    }
};
