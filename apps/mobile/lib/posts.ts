/**
 * Chiyu Social — Posts service (React Native)
 * ────────────────────────────────────────────────────────
 * Handles fetching and managing posts from Firestore.
 */

import { db, auth } from './firebase';
import { PostType } from '@/types';

/**
 * Fetch all posts for the current authenticated user and workspace
 */
export const getUserPosts = async (workspaceId?: string): Promise<PostType[]> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !workspaceId) return [];

    try {
        const snapshot = await db
            .collection('posts')
            .where('userId', '==', currentUser.uid)
            .where('workspaceId', '==', workspaceId)
            .orderBy('scheduledFor', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PostType[];
    } catch (error) {
        console.error('[posts] getUserPosts error:', error);
        return [];
    }
};

/**
 * Fetch upcoming posts (scheduled for the future)
 */
export const getUpcomingPosts = async (workspaceId?: string, limit = 5): Promise<PostType[]> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !workspaceId) return [];

    try {
        const now = new Date().toISOString();
        const snapshot = await db
            .collection('posts')
            .where('userId', '==', currentUser.uid)
            .where('workspaceId', '==', workspaceId)
            .where('status', '==', 'scheduled')
            .where('scheduledFor', '>', now)
            .orderBy('scheduledFor', 'asc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PostType[];
    } catch (error) {
        console.error('[posts] getUpcomingPosts error:', error);
        return [];
    }
};

/**
 * Get post stats (counts of scheduled/published/failed)
 */
export const getPostStats = async (workspaceId?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !workspaceId) return { scheduled: 0, published: 0, failed: 0 };

    try {
        const snapshot = await db
            .collection('posts')
            .where('userId', '==', currentUser.uid)
            .where('workspaceId', '==', workspaceId)
            .get();

        const stats = {
            scheduled: 0,
            published: 0,
            failed: 0
        };

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'scheduled') stats.scheduled++;
            else if (data.status === 'published') stats.published++;
            else if (data.status === 'failed') stats.failed++;
        });

        return stats;
    } catch (error) {
        console.error('[posts] getPostStats error:', error);
        return { scheduled: 0, published: 0, failed: 0 };
    }
};

