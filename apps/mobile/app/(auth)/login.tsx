/**
 * Login screen — mirrors app/login/page.tsx from the web app.
 * Uses the same Firebase email/password auth flow.
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import { View, Text, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { signIn, getAuthErrorMessage } from '@/lib/auth';

export default function LoginScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setIsLoading(true);
            await signIn(email.trim(), password);
            // AuthProvider will handle navigation to /(tabs)
        } catch (err: any) {
            setError(getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Brand header */}
                <View style={styles.brandContainer}>
                    <View style={[styles.logoCircle, { backgroundColor: colors.brand }]}>
                        <Ionicons name="calendar" size={32} color="#fff" />
                    </View>
                    <Text style={[styles.brandName, { color: colors.foreground }]}>
                        Chiyu Social
                    </Text>
                    <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
                        Schedule smarter. Grow faster.
                    </Text>
                </View>

                {/* Card */}
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            ...Shadow['2xl'],
                        },
                    ]}
                >
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                        Welcome Back
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
                        Enter your email and password to access your account
                    </Text>

                    {/* Email */}
                    <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
                    <View
                        style={[
                            styles.inputContainer,
                            { backgroundColor: colors.accent, borderColor: colors.border },
                        ]}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={18}
                            color={colors.mutedForeground}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="name@example.com"
                            placeholderTextColor={colors.mutedForeground}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoComplete="email"
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.passwordHeader}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                    </View>
                    <View
                        style={[
                            styles.inputContainer,
                            { backgroundColor: colors.accent, borderColor: colors.border },
                        ]}
                    >
                        <Ionicons
                            name="lock-closed-outline"
                            size={18}
                            color={colors.mutedForeground}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedForeground}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            textContentType="password"
                            autoComplete="password"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.mutedForeground}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Error */}
                    {error && (
                        <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15` }]}>
                            <Ionicons name="alert-circle" size={16} color={colors.destructive} />
                            <Text style={[styles.errorText, { color: colors.destructive }]}>
                                {error}
                            </Text>
                        </View>
                    )}

                    {/* Login button */}
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: colors.brand, opacity: isLoading ? 0.7 : 1 },
                        ]}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                        Don't have an account?{' '}
                    </Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text style={[styles.footerLink, { color: colors.brand }]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing['4xl'],
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: Spacing['2xl'],
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    brandName: {
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
    },
    brandTagline: {
        fontSize: FontSize.sm,
        marginTop: Spacing.xs,
    },
    card: {
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    cardTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    cardDescription: {
        fontSize: FontSize.sm,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        marginBottom: Spacing.xs,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.base,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.lg,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        height: 48,
        marginBottom: Spacing.xs,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSize.base,
        height: '100%',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    errorText: {
        flex: 1,
        fontSize: FontSize.sm,
    },
    primaryButton: {
        height: 52,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.lg,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    footerText: {
        fontSize: FontSize.sm,
    },
    footerLink: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
});
