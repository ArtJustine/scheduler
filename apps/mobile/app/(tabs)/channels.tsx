/**
 * Channels (Social) — iOS26 Liquid Glass aesthetic
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

// ── Platform metadata ───────────────────────────────────────────

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

function PlatformCard({
    platform,
    account,
    colors,
    isDark,
    onRemove,
}: {
    platform: PlatformInfo;
    account?: SocialAccount | null;
    colors: (typeof Colors)['light'];
    isDark: boolean;
    onRemove: (platform: SocialAccountType) => void;
}) {
    const connected = !!account?.connected;

    return (
        <GlassCard style={styles.platformCard} glassColor={connected ? platform.color : undefined}>
            <View style={[styles.platformIcon, { backgroundColor: `${platform.color}15` }]}>
                <Ionicons name={platform.icon} size={20} color={platform.color} />
            </View>
            <View style={styles.platformInfo}>
                <Text style={[styles.platformName, { color: colors.foreground }]}>{platform.label}</Text>
                <Text style={[styles.platformUsername, { color: colors.mutedForeground }]}>
                    {connected ? `@${account!.username}` : 'Not connected'}
                </Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.connectBtn,
                    connected
                        ? { backgroundColor: `${colors.destructive}10`, borderWidth: 1, borderColor: `${colors.destructive}20` }
                        : { overflow: 'hidden' },
                ]}
                activeOpacity={0.8}
                onPress={() =>
                    connected
                        ? onRemove(platform.key)
                        : Alert.alert('Connect', `Connecting ${platform.label} will be available soon. Use the web dashboard.`)
                }
            >
                {!connected && (
                    <LinearGradient
                        colors={[colors.brand, `${colors.brand}DD`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                <Text style={[styles.connectBtnText, { color: connected ? colors.destructive : '#fff' }]}>
                    {connected ? 'Remove' : 'Connect'}
                </Text>
            </TouchableOpacity>
        </GlassCard>
    );
}

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
        try {
            const connectedAccounts = await getConnectedAccounts(activeWorkspace.id);
            setAccounts(connectedAccounts);
        } catch (error) {
            console.error('[Channels] fetchAccounts error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.brand} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + 56 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        >
            <WorkspaceSwitcher />

            {/* Summary */}
            <GlassCard style={styles.summaryCard} glassColor={colors.brand}>
                <View style={[styles.summaryIcon, { backgroundColor: `${colors.brand}15` }]}>
                    <Ionicons name="link-outline" size={22} color={colors.brand} />
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

            {PLATFORMS.map((platform) => (
                <PlatformCard
                    key={platform.key}
                    platform={platform}
                    account={accounts[platform.key]}
                    colors={colors}
                    isDark={isDark}
                    onRemove={handleRemove}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: 20, paddingBottom: 120 },
    summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
    summaryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    summaryTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
    summaryDesc: { fontSize: 12, marginTop: 2, opacity: 0.7 },
    sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5, marginBottom: 14 },
    platformCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    platformIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    platformInfo: { flex: 1 },
    platformName: { fontSize: 14, fontWeight: '600' },
    platformUsername: { fontSize: 11, marginTop: 1, opacity: 0.6 },
    connectBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    connectBtnText: { fontSize: 12, fontWeight: '700' },
});
