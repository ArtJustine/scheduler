/**
 * Chiyu Social — Auth service (React Native)
 * ────────────────────────────────────────────────────────
 * Mirrors lib/firebase/auth.ts from the web app.
 * No "use client" directive, no DOM-specific APIs.
 */

import { auth, db } from './firebase';

// ── Sign up ─────────────────────────────────────────────────────
export const signUp = async (
    email: string,
    password: string,
    displayName: string,
) => {
    try {
        const credential = await auth.createUserWithEmailAndPassword(email, password);

        if (credential.user) {
            await credential.user.updateProfile({ displayName });

            // Mirror user document creation from web
            await db.collection('users').doc(credential.user.uid).set({
                uid: credential.user.uid,
                email: credential.user.email,
                displayName,
                createdAt: new Date().toISOString(),
            });
        }

        return { user: credential.user };
    } catch (error: any) {
        console.error('[auth] signUp error:', error);
        throw error;
    }
};

// ── Sign in ─────────────────────────────────────────────────────
export const signIn = async (email: string, password: string) => {
    try {
        const credential = await auth.signInWithEmailAndPassword(email, password);
        return { user: credential.user };
    } catch (error: any) {
        console.error('[auth] signIn error:', error);
        throw error;
    }
};

// ── Sign out ────────────────────────────────────────────────────
export const signOut = async () => {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error: any) {
        console.error('[auth] signOut error:', error);
        throw error;
    }
};

// ── Listen to auth state ────────────────────────────────────────
export const onAuthStateChange = (callback: (user: any | null) => void) => {
    return auth.onAuthStateChanged(callback);
};

// ── Get current user (one-shot) ─────────────────────────────────
export const getCurrentUser = (): Promise<any | null> => {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

// ── Get user profile from Firestore ─────────────────────────────
export const getUserProfile = async (uid: string) => {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) return null;
        return userDoc.data();
    } catch (error: any) {
        console.error('[auth] getUserProfile error:', error);
        throw error;
    }
};

// ── Update profile ──────────────────────────────────────────────
export const updateUserProfile = async (data: {
    displayName?: string;
    photoURL?: string;
}) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    try {
        await currentUser.updateProfile(data);
        await db.collection('users').doc(currentUser.uid).update({
            ...data,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('[auth] updateUserProfile error:', error);
        throw error;
    }
};

// ── Friendly error messages (same as web data-service.ts) ───────
export function getAuthErrorMessage(error: any): string {
    const code = error?.code || '';
    const msg = error?.message || '';

    if (code === 'auth/user-not-found')
        return 'No account found with that email. Please sign up.';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
        return "That password doesn't look right. Please try again.";
    if (code === 'auth/email-already-in-use')
        return 'An account with that email already exists. Please log in.';
    if (code === 'auth/weak-password')
        return 'Please choose a stronger password (at least 6 characters).';
    if (code === 'auth/invalid-email')
        return 'Please enter a valid email address.';
    if (msg.includes('Authentication service is unavailable'))
        return 'Authentication service is unavailable. Please try again.';

    return msg || 'Something went wrong. Please try again.';
}
