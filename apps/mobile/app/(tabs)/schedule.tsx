/**
 * Schedule tab — list of all scheduled / published / failed posts
 * with a FAB to create new posts.
 */

import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    useColorScheme,
    RefreshControl,
    TouchableOpacity,
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getUserPosts } from '@/lib/posts';
import type { PostType } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { useRouter } from 'expo-router';

// ── Filter chip ─────────────────────────────────────────────────

function FilterChip({
    label,
    active,
    onPress,
    colors,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    colors: (typeof Colors)['light'];
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.chip,
                {
                    backgroundColor: active ? colors.brand : colors.accent,
                    borderColor: active ? colors.brand : colors.border,
                },
            ]}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: active ? '#fff' : colors.mutedForeground },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

type FilterType = 'all' | 'scheduled' | 'published' | 'failed';

export default function ScheduleScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();
    const router = useRouter();

    const [filter, setFilter] = useState<FilterType>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<PostType[]>([]);

    const fetchPosts = async () => {
        if (!activeWorkspace) return;
        try {
            const allPosts = await getUserPosts(activeWorkspace.id);
            setPosts(allPosts);
        } catch (error) {
            console.error('[Schedule] fetchPosts error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user && activeWorkspace) {
            fetchPosts();
        } else if (!activeWorkspace) {
            setLoading(false);
        }
    }, [user, activeWorkspace]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const filteredPosts =
        filter === 'all' ? posts : posts.filter((p) => p.status === filter);

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.brand} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <WorkspaceSwitcher />

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
                style={[styles.filtersContainer, { borderBottomColor: colors.border }]}
            >
                {(['all', 'scheduled', 'published', 'failed'] as FilterType[]).map((f) => (
                    <FilterChip
                        key={f}
                        label={f === 'all' ? 'All Posts' : f.charAt(0).toUpperCase() + f.slice(1)}
                        active={filter === f}
                        onPress={() => setFilter(f)}
                        colors={colors}
                    />
                ))}
            </ScrollView>

            {/* Post list */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
                }
            >
                {filteredPosts.length === 0 ? (
                    <GlassCard style={styles.emptyState} intensity={15}>
                        <Ionicons name="document-text-outline" size={40} color={colors.mutedForeground} />
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
                        </Text>
                        <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
                            Go to the Post tab to schedule your first post
                        </Text>
                    </GlassCard>
                ) : (
                    filteredPosts.map((post) => (
                        <GlassCard
                            key={post.id}
                            style={styles.postCard}
                            intensity={15}
                        >
                            <Text numberOfLines={2} style={[styles.postTitle, { color: colors.foreground }]}>
                                {post.title || post.description?.slice(0, 60) || 'Untitled'}
                            </Text>
                            <View style={styles.postMeta}>
                                <View style={[styles.statusTag, { backgroundColor: post.status === 'published' ? '#22C55E20' : post.status === 'failed' ? `${colors.destructive}20` : `${colors.brand}20` }]}>
                                    <Text style={[styles.statusTagText, { color: post.status === 'published' ? '#22C55E' : post.status === 'failed' ? colors.destructive : colors.brand }]}>
                                        {post.status}
                                    </Text>
                                </View>
                                <View style={styles.postPlatform}>
                                    <Ionicons name="share-social-outline" size={14} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                                    <Text style={[styles.postMetaText, { color: colors.mutedForeground, textTransform: 'capitalize' }]}>
                                        {post.platform}
                                    </Text>
                                </View>
                                <Text style={[styles.postMetaText, { color: colors.mutedForeground }]}>
                                    {new Date(post.scheduledFor).toLocaleDateString()}
                                </Text>
                            </View>
                        </GlassCard>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    filtersContainer: {
        maxHeight: 52,
        borderBottomWidth: 1,
    },
    filtersRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    chip: {
        borderRadius: Radius.full,
        borderWidth: 1,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.xs,
    },
    chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    list: { flex: 1 },
    listContent: { padding: Spacing.base, paddingBottom: 100 },
    emptyState: {
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        padding: Spacing['2xl'],
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.xl,
    },
    emptyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
    emptyDescription: { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 260 },
    postCard: {
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        padding: Spacing.base,
        marginBottom: Spacing.md,
    },
    postTitle: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.sm
    },
    postMetaText: { fontSize: FontSize.xs },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.md,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        textTransform: 'uppercase',
    },
    postPlatform: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
