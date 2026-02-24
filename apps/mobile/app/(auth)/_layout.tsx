/**
 * Auth group layout — contains login / signup screens
 * with no tab bar visible.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}
