/**
 * Settings — iOS26 Liquid Glass aesthetic
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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { signOut } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import * as Linking from 'expo-linking';

// ── Row component ───────────────────────────────────────────────

function SettingsRow({
    icon,
    label,
    value,
    onPress,
    destructive,
    colors,
    isLast,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value?: string;
    onPress?: () => void;
    destructive?: boolean;
    colors: (typeof Colors)['light'];
    isLast?: boolean;
}) {
    const iconColor = destructive ? colors.destructive : colors.brand;
    return (
        <TouchableOpacity
            style={[
                styles.row,
                !isLast && { borderBottomWidth: 0.5, borderBottomColor: `${colors.border}80` },
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={[styles.rowIcon, { backgroundColor: `${iconColor}12` }]}>
                <Ionicons name={icon} size={16} color={iconColor} />
            </View>
            <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
                {label}
            </Text>
            {value && (
                <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
            )}
            {onPress && (
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} style={{ opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );
}

// ── Main screen ─────────────────────────────────────────────────

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out', style: 'destructive',
                onPress: async () => {
                    setLoggingOut(true);
                    try { await signOut(); } catch { Alert.alert('Error', 'Failed to log out.'); }
                    finally { setLoggingOut(false); }
                },
            },
        ]);
    };

    const initial =
        user?.displayName?.charAt(0).toUpperCase() ||
        user?.email?.charAt(0).toUpperCase() || 'C';

    const openLink = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open page.'));
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + 56 }]}
        >
            <WorkspaceSwitcher />

            {/* Profile */}
            <GlassCard style={styles.profileCard} glassColor={colors.brand}>
                <View style={styles.avatarWrap}>
                    <LinearGradient
                        colors={[colors.brand, `${colors.brand}CC`]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>{initial}</Text>
                    </LinearGradient>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.foreground }]}>
                        {user?.displayName || 'Chiyu User'}
                    </Text>
                    <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                        {user?.email}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: `${colors.foreground}08` }]}
                    onPress={() => Alert.alert('Edit Profile', 'Coming soon in the mobile app.')}
                >
                    <Ionicons name="create-outline" size={16} color={colors.foreground} />
                </TouchableOpacity>
            </GlassCard>

            {/* Account */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
            <GlassCard noPadding style={styles.sectionCard}>
                <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => { }} colors={colors} />
                <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => { }} colors={colors} />
                <SettingsRow icon="shield-checkmark-outline" label="Privacy" onPress={() => { }} colors={colors} isLast />
            </GlassCard>

            {/* Preferences */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREFERENCES</Text>
            <GlassCard noPadding style={styles.sectionCard}>
                <SettingsRow
                    icon={colorScheme === 'dark' ? 'moon-outline' : 'sunny-outline'}
                    label="Appearance"
                    value={colorScheme === 'dark' ? 'Dark' : 'Light'}
                    onPress={() => Alert.alert('Appearance', 'Follows your system light/dark mode.')}
                    colors={colors}
                />
                <SettingsRow icon="time-outline" label="Time Zone" value="Auto" onPress={() => { }} colors={colors} isLast />
            </GlassCard>

            {/* Support */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUPPORT</Text>
            <GlassCard noPadding style={styles.sectionCard}>
                <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => openLink('https://docs.chiyusocial.com')} colors={colors} />
                <SettingsRow icon="chatbubble-outline" label="Contact Us" onPress={() => openLink('mailto:support@chiyusocial.com')} colors={colors} />
                <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => openLink('https://chiyusocial.com/terms')} colors={colors} />
                <SettingsRow icon="lock-closed-outline" label="Privacy Policy" onPress={() => openLink('https://chiyusocial.com/privacy')} colors={colors} isLast />
            </GlassCard>

            {/* Logout */}
            <GlassCard noPadding style={[styles.sectionCard, { marginBottom: 20 }]}>
                <SettingsRow
                    icon="log-out-outline"
                    label={loggingOut ? 'Logging out…' : 'Log Out'}
                    onPress={handleLogout}
                    destructive
                    colors={colors}
                    isLast
                />
            </GlassCard>

            <Text style={[styles.version, { color: colors.mutedForeground }]}>Chiyu Social v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingBottom: 120 },
    profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
    avatarWrap: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    avatar: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
    profileEmail: { fontSize: 12, marginTop: 2, opacity: 0.6 },
    editBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4, opacity: 0.5 },
    sectionCard: { marginBottom: 24, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { flex: 1, fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
    rowValue: { fontSize: 13, opacity: 0.6 },
    version: { fontSize: 11, textAlign: 'center', marginTop: 8, opacity: 0.4 },
});
