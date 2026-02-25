/**
 * Channels (Social) — clean iOS design with gradient background
 */

import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    View,
    Text,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { getConnectedAccounts, removeSocialAccount } from '@/lib/accounts';
import type { SocialAccountType, SocialAccount } from '@/types';

interface PlatformInfo {
    key: SocialAccountType;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
}

const PLATFORMS: PlatformInfo[] = [
    { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
    { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { key: 'twitter', label: 'X / Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
    { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', color: '#010101' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2' },
    { key: 'pinterest', label: 'Pinterest', icon: 'logo-pinterest', color: '#E60023' },
    { key: 'threads', label: 'Threads', icon: 'at-outline', color: '#000000' },
    { key: 'bluesky', label: 'Bluesky', icon: 'cloud-outline', color: '#0085FF' },
];

export default function ChannelsScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Partial<Record<SocialAccountType, SocialAccount>>>({});

    const fetchAccounts = async () => {
        if (!activeWorkspace) return;
        try { setAccounts(await getConnectedAccounts(activeWorkspace.id)); }
        catch (e) { console.error('[Channels] fetchAccounts error:', e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => {
        if (user && activeWorkspace) fetchAccounts();
        else if (!activeWorkspace) setLoading(false);
    }, [user, activeWorkspace]);

    const handleRemove = (platform: SocialAccountType) => {
        if (!activeWorkspace) return;
        Alert.alert('Remove Account', `Disconnect your ${platform} account?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: async () => {
                    try { await removeSocialAccount(activeWorkspace.id, platform); fetchAccounts(); }
                    catch { Alert.alert('Error', 'Failed to remove account'); }
                },
            },
        ]);
    };

    const connectedCount = Object.values(accounts).filter((a) => a?.connected).length;
    const onRefresh = () => { setRefreshing(true); fetchAccounts(); };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered]}>
                <LinearGradient colors={isDark ? ['#0A0A0A', '#0A0A0A'] : ['#EDF4FD', '#F0ECFB', '#FEFEFE']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color={colors.brand} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 52 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
                showsVerticalScrollIndicator={false}
            >


                {/* Summary */}
                <GlassCard style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: `${colors.brand}10` }]}>
                        <Ionicons name="link-outline" size={20} color={colors.brand} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
                            {connectedCount} / {PLATFORMS.length} Connected
                        </Text>
                        <Text style={[styles.summaryDesc, { color: colors.mutedForeground }]}>
                            Connect accounts to start scheduling
                        </Text>
                    </View>
                </GlassCard>

                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Platforms</Text>

                {/* Platform list as a single card with dividers */}
                <GlassCard noPadding>
                    {PLATFORMS.map((platform, i) => {
                        const account = accounts[platform.key];
                        const connected = !!account?.connected;
                        return (
                            <View key={platform.key}>
                                <View style={styles.platformRow}>
                                    <View style={[styles.platformIcon, { backgroundColor: `${platform.color}10` }]}>
                                        <Ionicons name={platform.icon} size={18} color={platform.color} />
                                    </View>
                                    <View style={styles.platformInfo}>
                                        <Text style={[styles.platformName, { color: colors.foreground }]}>{platform.label}</Text>
                                        <Text style={[styles.platformStatus, { color: colors.mutedForeground }]}>
                                            {connected ? `@${account!.username}` : 'Not connected'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.connectBtn,
                                            connected
                                                ? { backgroundColor: `${colors.destructive}08`, borderWidth: 1, borderColor: `${colors.destructive}20` }
                                                : { backgroundColor: colors.brand },
                                        ]}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            connected
                                                ? handleRemove(platform.key)
                                                : Alert.alert('Connect', `Connect ${platform.label} from the web dashboard.`)
                                        }
                                    >
                                        <Text style={[styles.connectText, { color: connected ? colors.destructive : '#fff' }]}>
                                            {connected ? 'Remove' : 'Connect'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {i < PLATFORMS.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                )}
                            </View>
                        );
                    })}
                </GlassCard>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: 20, paddingBottom: 120 },
    summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    summaryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    summaryTitle: { fontSize: 15, fontWeight: '600' },
    summaryDesc: { fontSize: 12, marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3, marginBottom: 12 },
    platformRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
    platformIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    platformInfo: { flex: 1 },
    platformName: { fontSize: 14, fontWeight: '500' },
    platformStatus: { fontSize: 12, marginTop: 1 },
    connectBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    connectText: { fontSize: 12, fontWeight: '600' },
    divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});
