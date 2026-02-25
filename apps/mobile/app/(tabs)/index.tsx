/**
 * Dashboard — iOS26 Liquid Glass aesthetic
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getUpcomingPosts, getPostStats } from '@/lib/posts';
import type { PostType } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';

// ── Stat card ───────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  colors,
  accent,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  colors: (typeof Colors)['light'];
  accent?: string;
}) {
  const accentColor = accent || colors.brand;
  return (
    <GlassCard style={styles.statCard} glassColor={accentColor}>
      <View style={styles.statTop}>
        <View style={[styles.statIcon, { backgroundColor: `${accentColor}15` }]}>
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: `${trendUp ? '#22C55E' : colors.destructive}12` }]}>
            <Ionicons
              name={trendUp ? 'trending-up' : 'trending-down'}
              size={11}
              color={trendUp ? '#22C55E' : colors.destructive}
            />
            <Text style={[styles.trendText, { color: trendUp ? '#22C55E' : colors.destructive }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </GlassCard>
  );
}

// ── Post row ────────────────────────────────────────────────────

const platformIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  instagram: 'logo-instagram',
  youtube: 'logo-youtube',
  tiktok: 'logo-tiktok',
  facebook: 'logo-facebook',
  twitter: 'logo-twitter',
  linkedin: 'logo-linkedin',
  pinterest: 'logo-pinterest',
};

function PostRow({
  post,
  colors,
  isLast,
}: {
  post: PostType;
  colors: (typeof Colors)['light'];
  isLast?: boolean;
}) {
  const iconName = platformIcons[post.platform] ?? 'globe-outline';
  const statusColors: Record<string, string> = {
    scheduled: colors.brand,
    published: '#22C55E',
    failed: colors.destructive,
    partial: '#F59E0B',
  };
  const statusColor = statusColors[post.status] ?? colors.mutedForeground;

  return (
    <View style={[styles.postRow, !isLast && { borderBottomWidth: 0.5, borderBottomColor: `${colors.border}80` }]}>
      <View style={[styles.postIcon, { backgroundColor: `${colors.brand}10` }]}>
        <Ionicons name={iconName} size={16} color={colors.brand} />
      </View>
      <View style={styles.postInfo}>
        <Text numberOfLines={1} style={[styles.postTitle, { color: colors.foreground }]}>
          {post.title || post.description?.slice(0, 40) || 'Untitled post'}
        </Text>
        <Text style={[styles.postMeta, { color: colors.mutedForeground }]}>
          {post.platform} · {new Date(post.scheduledFor).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: `${statusColor}14` }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {post.status}
        </Text>
      </View>
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [stats, setStats] = useState({ scheduled: 0, published: 0, failed: 0 });

  const fetchData = async () => {
    if (!activeWorkspace) return;
    try {
      const [upcomingPosts, postStats] = await Promise.all([
        getUpcomingPosts(activeWorkspace.id, 5),
        getPostStats(activeWorkspace.id)
      ]);
      setPosts(upcomingPosts);
      setStats(postStats);
    } catch (error) {
      console.error('[Dashboard] fetchData error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && activeWorkspace) fetchData();
    else if (!activeWorkspace) setLoading(false);
  }, [user, activeWorkspace]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };
  const displayName = user?.displayName ?? 'there';

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
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
    >
      <WorkspaceSwitcher />

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={[styles.greetingText, { color: colors.foreground }]}>
          Hey, {displayName} 👋
        </Text>
        <Text style={[styles.greetingSub, { color: colors.mutedForeground }]}>
          Here's your {activeWorkspace?.name || 'social media'} overview
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar-outline" label="Scheduled" value={stats.scheduled.toString()}
          trend={stats.scheduled > 0 ? `${stats.scheduled} total` : undefined} trendUp
          colors={colors} accent={colors.brand}
        />
        <StatCard
          icon="checkmark-circle-outline" label="Published" value={stats.published.toString()}
          trend={stats.published > 0 ? `${stats.published} total` : undefined} trendUp
          colors={colors} accent="#22C55E"
        />
        <StatCard
          icon="people-outline" label="Followers" value="—"
          colors={colors} accent="#8B5CF6"
        />
        <StatCard
          icon="pulse-outline" label="Engagement" value="—"
          colors={colors} accent="#F59E0B"
        />
      </View>

      {/* Upcoming posts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Posts</Text>
        {posts.length > 0 && (
          <TouchableOpacity><Text style={[styles.seeAll, { color: colors.brand }]}>See all</Text></TouchableOpacity>
        )}
      </View>

      {posts.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.brand}10` }]}>
            <Ionicons name="calendar-outline" size={28} color={colors.brand} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Create your first post from the Post tab
          </Text>
        </GlassCard>
      ) : (
        <GlassCard noPadding style={styles.postsCard}>
          {posts.map((post, i) => (
            <PostRow key={post.id} post={post} colors={colors} isLast={i === posts.length - 1} />
          ))}
        </GlassCard>
      )}
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  greeting: { marginBottom: 24, marginTop: 8 },
  greetingText: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  greetingSub: { fontSize: 14, marginTop: 4, opacity: 0.7 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { width: '47%', flexGrow: 1 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 2, opacity: 0.7 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  trendText: { fontSize: 10, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyDesc: { fontSize: 13, textAlign: 'center', maxWidth: 240, opacity: 0.7, lineHeight: 18 },
  postsCard: { overflow: 'hidden' },
  postRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  postIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  postInfo: { flex: 1 },
  postTitle: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  postMeta: { fontSize: 11, marginTop: 2, opacity: 0.6 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
});
