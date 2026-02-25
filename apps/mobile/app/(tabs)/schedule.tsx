/**
 * Schedule — iOS26 Liquid Glass aesthetic
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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getUserPosts } from '@/lib/posts';
import type { PostType } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';

// ── Filter chip ─────────────────────────────────────────────────

type FilterType = 'all' | 'scheduled' | 'published' | 'failed';

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
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.chip, active && { overflow: 'hidden' }]}>
                {active ? (
                    <>
                        <LinearGradient
                            colors={[colors.brand, `${colors.brand}DD`]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <Text style={[styles.chipText, { color: '#fff' }]}>{label}</Text>
                    </>
                ) : (
                    <>
                        <View style={[StyleSheet.absoluteFill, {
                            backgroundColor: colors.accent,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 20,
                        }]} />
                        <Text style={[styles.chipText, { color: colors.mutedForeground }]}>{label}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}

// ── Platform icons ──────────────────────────────────────────────

const platformIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    instagram: 'logo-instagram',
    youtube: 'logo-youtube',
    tiktok: 'logo-tiktok',
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    linkedin: 'logo-linkedin',
    pinterest: 'logo-pinterest',
};

// ── Main screen ─────────────────────────────────────────────────

export default function ScheduleScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();

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
        if (user && activeWorkspace) fetchPosts();
        else if (!activeWorkspace) setLoading(false);
    }, [user, activeWorkspace]);

    const onRefresh = () => { setRefreshing(true); fetchPosts(); };
    const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.brand} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Filters */}
            <View style={[styles.filtersWrap, { paddingTop: insets.top + 52 }]}>
                <WorkspaceSwitcher />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersRow}
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
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
            </View>

            {/* Post list */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
            >
                {filteredPosts.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <View style={[styles.emptyIcon, { backgroundColor: `${colors.brand}10` }]}>
                            <Ionicons name="document-text-outline" size={28} color={colors.brand} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
                        </Text>
                        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                            Go to the Post tab to schedule your first post
                        </Text>
                    </GlassCard>
                ) : (
                    filteredPosts.map((post) => {
                        const iconName = platformIcons[post.platform] ?? 'globe-outline';
                        const statusColors: Record<string, string> = {
                            scheduled: colors.brand,
                            published: '#22C55E',
                            failed: colors.destructive,
                            partial: '#F59E0B',
                        };
                        const sc = statusColors[post.status] ?? colors.mutedForeground;

                        return (
                            <GlassCard key={post.id} style={styles.postCard}>
                                <Text numberOfLines={2} style={[styles.postTitle, { color: colors.foreground }]}>
                                    {post.title || post.description?.slice(0, 60) || 'Untitled'}
                                </Text>
                                <View style={styles.postMeta}>
                                    <View style={[styles.statusPill, { backgroundColor: `${sc}14` }]}>
                                        <View style={[styles.statusDot, { backgroundColor: sc }]} />
                                        <Text style={[styles.statusText, { color: sc }]}>{post.status}</Text>
                                    </View>
                                    <View style={styles.platformRow}>
                                        <Ionicons name={iconName} size={13} color={colors.mutedForeground} />
                                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                                            {post.platform}
                                        </Text>
                                    </View>
                                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                                        {new Date(post.scheduledFor).toLocaleDateString()}
                                    </Text>
                                </View>
                            </GlassCard>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    filtersWrap: { paddingHorizontal: 20 },
    filtersRow: { flexDirection: 'row', gap: 8, paddingVertical: 10 },
    chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, minWidth: 70, alignItems: 'center' },
    chipText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.2 },
    separator: { height: 0.5, marginTop: 4 },
    list: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 120 },
    emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 10, marginTop: 20 },
    emptyIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    emptyTitle: { fontSize: 16, fontWeight: '700' },
    emptyDesc: { fontSize: 13, textAlign: 'center', maxWidth: 240, opacity: 0.7, lineHeight: 18 },
    postCard: { marginBottom: 12 },
    postTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, marginBottom: 10 },
    postMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    statusDot: { width: 5, height: 5, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
    platformRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, opacity: 0.7 },
});
