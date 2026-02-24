/**
 * Settings tab — user profile, preferences, and logout.
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    Alert,
    View,
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';

// ── Settings row ────────────────────────────────────────────────

function SettingsRow({
    icon,
    label,
    value,
    onPress,
    destructive,
    colors,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value?: string;
    onPress?: () => void;
    destructive?: boolean;
    colors: (typeof Colors)['light'];
}) {
    return (
        <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={[styles.settingsIconWrap, { backgroundColor: destructive ? `${colors.destructive}15` : `${colors.brand}12` }]}>
                <Ionicons name={icon} size={18} color={destructive ? colors.destructive : colors.brand} />
            </View>
            <Text
                style={[
                    styles.settingsLabel,
                    { color: destructive ? colors.destructive : colors.foreground },
                ]}
            >
                {label}
            </Text>
            {value && (
                <Text style={[styles.settingsValue, { color: colors.mutedForeground }]}>{value}</Text>
            )}
            {onPress && (
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            )}
        </TouchableOpacity>
    );
}

// ── Main component ──────────────────────────────────────────────

export default function SettingsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    setLoggingOut(true);
                    try {
                        await signOut();
                        // AuthProvider will redirect to login
                    } catch {
                        Alert.alert('Error', 'Failed to log out. Please try again.');
                    } finally {
                        setLoggingOut(false);
                    }
                },
            },
        ]);
    };

    const initial =
        user?.displayName?.charAt(0).toUpperCase() ||
        user?.email?.charAt(0).toUpperCase() ||
        'C';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Profile card */}
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, ...Shadow.md }]}>
                <View style={[styles.avatar, { backgroundColor: colors.brand }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.foreground }]}>
                        {user?.displayName || 'Chiyu User'}
                    </Text>
                    <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                        {user?.email}
                    </Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="create-outline" size={20} color={colors.brand} />
                </TouchableOpacity>
            </View>

            {/* Account section */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => { }} colors={colors} />
                <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => { }} colors={colors} />
                <SettingsRow icon="shield-checkmark-outline" label="Privacy" onPress={() => { }} colors={colors} />
            </View>

            {/* Preferences section */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <SettingsRow icon="moon-outline" label="Appearance" value="System" onPress={() => { }} colors={colors} />
                <SettingsRow icon="time-outline" label="Time Zone" value="Auto" onPress={() => { }} colors={colors} />
                <SettingsRow icon="language-outline" label="Language" value="English" onPress={() => { }} colors={colors} />
            </View>

            {/* Support section */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SUPPORT</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => { }} colors={colors} />
                <SettingsRow icon="chatbubble-outline" label="Contact Us" onPress={() => { }} colors={colors} />
                <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => { }} colors={colors} />
                <SettingsRow icon="lock-closed-outline" label="Privacy Policy" onPress={() => { }} colors={colors} />
            </View>

            {/* Logout */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing['4xl'] }]}>
                <SettingsRow
                    icon="log-out-outline"
                    label={loggingOut ? 'Logging out…' : 'Log Out'}
                    onPress={handleLogout}
                    destructive
                    colors={colors}
                />
            </View>

            {/* Version */}
            <Text style={[styles.version, { color: colors.mutedForeground }]}>
                Chiyu Social v1.0.0
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.base, paddingBottom: Spacing['5xl'] },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        padding: Spacing.base,
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    profileInfo: { flex: 1 },
    profileName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
    profileEmail: { fontSize: FontSize.xs, marginTop: 2 },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    settingsCard: {
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
        borderBottomWidth: 1,
        gap: Spacing.md,
    },
    settingsIconWrap: {
        width: 32,
        height: 32,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    settingsValue: { fontSize: FontSize.sm },
    version: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.md },
});
