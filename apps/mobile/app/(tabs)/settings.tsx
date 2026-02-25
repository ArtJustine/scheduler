/**
 * Settings — clean iOS design with gradient background
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

// ── Row ─────────────────────────────────────────────────────────

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
    const iconColor = destructive ? '#FF3B30' : colors.brand;
    return (
        <>
            <TouchableOpacity
                style={styles.row}
                onPress={onPress}
                activeOpacity={onPress ? 0.6 : 1}
                disabled={!onPress}
            >
                <View style={[styles.rowIcon, { backgroundColor: `${iconColor}10` }]}>
                    <Ionicons name={icon} size={16} color={iconColor} />
                </View>
                <Text style={[styles.rowLabel, { color: destructive ? '#FF3B30' : colors.foreground }]}>
                    {label}
                </Text>
                {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
                {onPress && <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />}
            </TouchableOpacity>
            {!isLast && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        </>
    );
}

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
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

    const initial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'C';
    const openLink = (url: string) => Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open page.'));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDark ? ['#0A0A0A', '#0F1117', '#0A0A0A'] : ['#EDF4FD', '#F0ECFB', '#FDF2F0', '#FEFEFE']}
                locations={isDark ? [0, 0.5, 1] : [0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 52 }]}
                showsVerticalScrollIndicator={false}
            >
                <WorkspaceSwitcher />

                {/* Profile */}
                <GlassCard style={styles.profileCard}>
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
                    <TouchableOpacity onPress={() => Alert.alert('Edit Profile', 'Coming soon.')}>
                        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </GlassCard>

                {/* Account */}
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
                <GlassCard noPadding>
                    <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => { }} colors={colors} />
                    <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => { }} colors={colors} />
                    <SettingsRow icon="shield-checkmark-outline" label="Privacy" onPress={() => { }} colors={colors} isLast />
                </GlassCard>

                {/* Preferences */}
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREFERENCES</Text>
                <GlassCard noPadding>
                    <SettingsRow
                        icon={colorScheme === 'dark' ? 'moon-outline' : 'sunny-outline'}
                        label="Appearance" value={colorScheme === 'dark' ? 'Dark' : 'Light'}
                        onPress={() => Alert.alert('Appearance', 'Follows system settings.')}
                        colors={colors}
                    />
                    <SettingsRow icon="time-outline" label="Time Zone" value="Auto" onPress={() => { }} colors={colors} isLast />
                </GlassCard>

                {/* Support */}
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUPPORT</Text>
                <GlassCard noPadding>
                    <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => openLink('https://docs.chiyusocial.com')} colors={colors} />
                    <SettingsRow icon="chatbubble-outline" label="Contact Us" onPress={() => openLink('mailto:support@chiyusocial.com')} colors={colors} />
                    <SettingsRow icon="document-text-outline" label="Terms" onPress={() => openLink('https://chiyusocial.com/terms')} colors={colors} />
                    <SettingsRow icon="lock-closed-outline" label="Privacy Policy" onPress={() => openLink('https://chiyusocial.com/privacy')} colors={colors} isLast />
                </GlassCard>

                {/* Logout */}
                <GlassCard noPadding style={{ marginTop: 8 }}>
                    <SettingsRow
                        icon="log-out-outline"
                        label={loggingOut ? 'Logging out…' : 'Log Out'}
                        onPress={handleLogout} destructive colors={colors} isLast
                    />
                </GlassCard>

                <Text style={[styles.version, { color: colors.mutedForeground }]}>Chiyu Social v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingBottom: 120 },
    profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 16, fontWeight: '600' },
    profileEmail: { fontSize: 12, marginTop: 2 },
    sectionLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, marginTop: 24, marginBottom: 8, paddingLeft: 4 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
    rowIcon: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '400' },
    rowValue: { fontSize: 14 },
    divider: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
    version: { fontSize: 11, textAlign: 'center', marginTop: 24 },
});
