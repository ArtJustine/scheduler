/**
 * Channels tab — shows connected social media platforms.
 * Mirrors the sidebar "Channels" section from the web app.
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    View,
    Text,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import type { SocialAccountType, SocialAccount } from '@/types';

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

// ── Platform card ───────────────────────────────────────────────

function PlatformCard({
    platform,
    account,
    colors,
}: {
    platform: PlatformInfo;
    account?: SocialAccount | null;
    colors: (typeof Colors)['light'];
}) {
    const connected = !!account?.connected;
    const brandColor = colors[platform.colorKey] as string;

    return (
        <View
            style={[
                styles.platformCard,
                { backgroundColor: colors.card, borderColor: colors.border, ...Shadow.sm },
            ]}
        >
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
                        ? { backgroundColor: `${colors.brand}15` }
                        : { backgroundColor: colors.brand },
                ]}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.connectButtonText,
                        { color: connected ? colors.brand : '#fff' },
                    ]}
                >
                    {connected ? 'Manage' : 'Connect'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ── Main component ──────────────────────────────────────────────

export default function ChannelsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [refreshing, setRefreshing] = useState(false);

    // Placeholder — will be fetched from Firestore workspace.accounts
    const connectedAccounts: Partial<Record<SocialAccountType, SocialAccount>> = {};

    const connectedCount = Object.values(connectedAccounts).filter((a) => a?.connected).length;

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1200);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
            }
        >
            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, ...Shadow.md }]}>
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
            </View>

            {/* Platform list */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Platforms</Text>

            {PLATFORMS.map((platform) => (
                <PlatformCard
                    key={platform.key}
                    platform={platform}
                    account={connectedAccounts[platform.key]}
                    colors={colors}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
