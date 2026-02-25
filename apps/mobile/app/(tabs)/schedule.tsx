/**
 * Schedule — clean iOS design with gradient background
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

type FilterType = 'all' | 'scheduled' | 'published' | 'failed';

const platformIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    instagram: 'logo-instagram',
    youtube: 'logo-youtube',
    tiktok: 'logo-tiktok',
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    linkedin: 'logo-linkedin',
    pinterest: 'logo-pinterest',
};

export default function ScheduleScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();

    const [filter, setFilter] = useState<FilterType>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<PostType[]>([]);

    const fetchPosts = async () => {
        if (!activeWorkspace) return;
        try { setPosts(await getUserPosts(activeWorkspace.id)); }
        catch (e) { console.error('[Schedule] fetchPosts error:', e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => {
        if (user && activeWorkspace) fetchPosts();
        else if (!activeWorkspace) setLoading(false);
    }, [user, activeWorkspace]);

    const onRefresh = () => { setRefreshing(true); fetchPosts(); };
    const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

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
            <LinearGradient
                colors={isDark ? ['#0A0A0A', '#0F1117', '#0A0A0A'] : ['#EDF4FD', '#F0ECFB', '#FDF2F0', '#FEFEFE']}
                locations={isDark ? [0, 0.5, 1] : [0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Fixed top area with workspace + filters */}
            <View style={[styles.topArea, { paddingTop: insets.top + 52 }]}>
                <View style={{ paddingHorizontal: 20 }}>
                    <WorkspaceSwitcher />
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersRow}
                >
                    {(['all', 'scheduled', 'published', 'failed'] as FilterType[]).map((f) => {
                        const active = filter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFilter(f)}
                                style={[
                                    styles.chip,
                                    active
                                        ? { backgroundColor: colors.brand }
                                        : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: colors.border },
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, { color: active ? '#fff' : colors.foreground }]}>
                                    {f === 'all' ? 'All Posts' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Post list */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
                showsVerticalScrollIndicator={false}
            >
                {filteredPosts.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <View style={[styles.emptyIcon, { backgroundColor: `${colors.brand}08` }]}>
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
                            scheduled: colors.brand, published: '#34C759', failed: '#FF3B30', partial: '#FF9500',
                        };
                        const sc = statusColors[post.status] ?? colors.mutedForeground;

                        return (
                            <GlassCard key={post.id} style={styles.postCard}>
                                <View style={styles.postHeader}>
                                    <View style={[styles.postPlatformIcon, { backgroundColor: `${colors.brand}08` }]}>
                                        <Ionicons name={iconName} size={16} color={colors.mutedForeground} />
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${sc}12` }]}>
                                        <View style={[styles.statusDot, { backgroundColor: sc }]} />
                                        <Text style={[styles.statusLabel, { color: sc }]}>{post.status}</Text>
                                    </View>
                                </View>
                                <Text numberOfLines={2} style={[styles.postTitle, { color: colors.foreground }]}>
                                    {post.title || post.description?.slice(0, 80) || 'Untitled'}
                                </Text>
                                <View style={styles.postFooter}>
                                    <Text style={[styles.postMeta, { color: colors.mutedForeground }]}>
                                        {post.platform} · {new Date(post.scheduledFor).toLocaleDateString()}
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

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    topArea: { zIndex: 10 },
    filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
    chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    chipText: { fontSize: 13, fontWeight: '600' },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 8 },
    emptyCard: { alignItems: 'center', paddingVertical: 36, gap: 8, marginTop: 20 },
    emptyIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    emptyTitle: { fontSize: 16, fontWeight: '600' },
    emptyDesc: { fontSize: 13, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
    postCard: { marginBottom: 12 },
    postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    postPlatformIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusDot: { width: 5, height: 5, borderRadius: 3 },
    statusLabel: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    postTitle: { fontSize: 15, fontWeight: '500', letterSpacing: -0.2, marginBottom: 6 },
    postFooter: {},
    postMeta: { fontSize: 12 },
});
