/**
 * Chiyu Social — Auth context (React Native)
 * ────────────────────────────────────────────────────────
 * Mirrors lib/auth-provider.tsx from the web app, but
 * uses expo-router navigation instead of next/navigation
 * and stores no DOM cookies.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
    user: any | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

/**
 * Protects routes based on auth state:
 *  - Unauthenticated users → pushed to /login
 *  - Authenticated users on (auth) group → pushed to /(tabs)
 */
function useProtectedRoute(user: any | null, loading: boolean) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Not signed in, redirect to login
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Signed in but still on auth screen, go to main app
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useProtectedRoute(user, loading);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
