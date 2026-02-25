/**
 * Channels tab — shows connected social media platforms.
 * Mirrors the sidebar "Channels" section from the web app.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { getConnectedAccounts, removeSocialAccount } from '@/lib/accounts';
import type { SocialAccountType, SocialAccount } from '@/types';
import { Alert } from 'react-native';

// ── Platform metadata ───────────────────────────────────────────

interface PlatformInfo {
    key: SocialAccountType;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    colorKey: keyof (typeof Colors)['light'];
}

const PLATFORMS: PlatformInfo[] = [
    { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', colorKey: 'platformInstagram' },
    { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', colorKey: 'platformFacebook' },
    { key: 'twitter', label: 'X / Twitter', icon: 'logo-twitter', colorKey: 'platformTwitter' },
    { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', colorKey: 'platformYoutube' },
    { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', colorKey: 'platformTiktok' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin', colorKey: 'platformLinkedin' },
    { key: 'pinterest', label: 'Pinterest', icon: 'logo-pinterest', colorKey: 'platformPinterest' },
    { key: 'threads', label: 'Threads', icon: 'at-outline', colorKey: 'platformThreads' },
    { key: 'bluesky', label: 'Bluesky', icon: 'cloud-outline', colorKey: 'platformBluesky' },
];

function PlatformCard({
    platform,
    account,
    colors,
    onRemove,
}: {
    platform: PlatformInfo;
    account?: SocialAccount | null;
    colors: (typeof Colors)['light'];
    onRemove: (platform: SocialAccountType) => void;
}) {
    const connected = !!account?.connected;
    const brandColor = (colors[platform.colorKey] as string) || colors.brand;

    return (
        <GlassCard style={styles.platformCard} intensity={20}>
            <View style={[styles.platformIconWrap, { backgroundColor: `${brandColor}15` }]}>
                <Ionicons name={platform.icon} size={22} color={brandColor} />
            </View>

            <View style={styles.platformInfo}>
                <Text style={[styles.platformName, { color: colors.foreground }]}>
                    {platform.label}
                </Text>
                {connected ? (
                    <Text style={[styles.platformUsername, { color: colors.mutedForeground }]}>
                        @{account!.username}
                    </Text>
                ) : (
                    <Text style={[styles.platformUsername, { color: colors.mutedForeground }]}>
                        Not connected
                    </Text>
                )}
            </View>

            <TouchableOpacity
                style={[
                    styles.connectButton,
                    connected
                        ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.destructive + '40' }
                        : { backgroundColor: colors.brand },
                ]}
                activeOpacity={0.8}
                onPress={() => connected ? onRemove(platform.key) : Alert.alert('Connect', `Connecting ${platform.label} will be available soon in the app. For now, please use the web dashboard.`)}
            >
                <Text
                    style={[
                        styles.connectButtonText,
                        { color: connected ? colors.destructive : '#fff' },
                    ]}
                >
                    {connected ? 'Remove' : 'Connect'}
                </Text>
            </TouchableOpacity>
        </GlassCard>
    );
}

export default function ChannelsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
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
        if (user && activeWorkspace) {
            fetchAccounts();
        } else if (!activeWorkspace) {
            setLoading(false);
        }
    }, [user, activeWorkspace]);

    const handleRemove = (platform: SocialAccountType) => {
        if (!activeWorkspace) return;
        Alert.alert(
            'Remove Account',
            `Are you sure you want to disconnect your ${platform} account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeSocialAccount(activeWorkspace.id, platform);
                            fetchAccounts();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to remove account');
                        }
                    }
                }
            ]
        );
    };

    const connectedCount = Object.values(accounts).filter((a) => a?.connected).length;

    const onRefresh = () => {
        setRefreshing(true);
        fetchAccounts();
    };

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
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
            }
        >
            <WorkspaceSwitcher />

            {/* Summary */}
            <GlassCard style={styles.summaryCard} intensity={25}>
                <View style={[styles.summaryIcon, { backgroundColor: `${colors.brand}15` }]}>
                    <Ionicons name="link-outline" size={22} color={colors.brand} />
                </View>
                <View>
                    <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
                        {connectedCount} / {PLATFORMS.length} Connected
                    </Text>
                    <Text style={[styles.summaryDescription, { color: colors.mutedForeground }]}>
                        Connect your accounts to start scheduling
                    </Text>
                </View>
            </GlassCard>

            {/* Platform list */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Platforms</Text>

            {PLATFORMS.map((platform) => (
                <PlatformCard
                    key={platform.key}
                    platform={platform}
                    account={accounts[platform.key]}
                    colors={colors}
                    onRemove={handleRemove}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    content: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        padding: Spacing.base,
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    summaryIcon: {
        width: 44,
        height: 44,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
    summaryDescription: { fontSize: FontSize.xs, marginTop: 2 },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.md,
    },
    platformCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        padding: Spacing.base,
        marginBottom: Spacing.md,
        gap: Spacing.md,
    },
    platformIconWrap: {
        width: 40,
        height: 40,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    platformInfo: { flex: 1 },
    platformName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    platformUsername: { fontSize: FontSize.xs, marginTop: 2 },
    connectButton: {
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.xs + 2,
    },
    connectButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
