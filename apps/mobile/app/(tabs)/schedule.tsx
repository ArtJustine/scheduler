/**
 * Schedule tab — list of all scheduled / published / failed posts
 * with a FAB to create new posts.
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    useColorScheme,
    RefreshControl,
    TouchableOpacity,
    View,
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import type { PostType } from '@/types';

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

// ── Main component ──────────────────────────────────────────────

type FilterType = 'all' | 'scheduled' | 'published' | 'failed';

export default function ScheduleScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [filter, setFilter] = useState<FilterType>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Placeholder — replace with Firestore query
    const [posts] = useState<PostType[]>([]);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1200);
    };

    const filteredPosts =
        filter === 'all' ? posts : posts.filter((p) => p.status === filter);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="document-text-outline" size={40} color={colors.mutedForeground} />
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
                        </Text>
                        <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
                            Tap the + button to schedule your first post
                        </Text>
                    </View>
                ) : (
                    filteredPosts.map((post) => (
                        <View
                            key={post.id}
                            style={[
                                styles.postCard,
                                { backgroundColor: colors.card, borderColor: colors.border, ...Shadow.sm },
                            ]}
                        >
                            <Text numberOfLines={2} style={[styles.postTitle, { color: colors.foreground }]}>
                                {post.title || post.description?.slice(0, 60) || 'Untitled'}
                            </Text>
                            <View style={styles.postMeta}>
                                <Text style={[styles.postMetaText, { color: colors.mutedForeground }]}>
                                    {post.platform}
                                </Text>
                                <Text style={[styles.postMetaText, { color: colors.mutedForeground }]}>
                                    {new Date(post.scheduledFor).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.brand, ...Shadow.lg }]}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    postMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
    postMetaText: { fontSize: FontSize.xs },
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
