/**
 * Dashboard tab — overview of scheduled posts and stats.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getUpcomingPosts, getPostStats } from '@/lib/posts';
import type { PostType } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';

// ── Stat card component ─────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  colors: (typeof Colors)['light'];
}) {
  return (
    <GlassCard style={styles.statCard} intensity={20}>
      <View style={[styles.statIconContainer, { backgroundColor: `${colors.brand}15` }]}>
        <Ionicons name={icon} size={20} color={colors.brand} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={14}
            color={trendUp ? '#22C55E' : colors.destructive}
          />
          <Text
            style={[
              styles.trendText,
              { color: trendUp ? '#22C55E' : colors.destructive },
            ]}
          >
            {trend}
          </Text>
        </View>
      )}
    </GlassCard>
  );
}

// ── Upcoming post row ───────────────────────────────────────────

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
}: {
  post: PostType;
  colors: (typeof Colors)['light'];
}) {
  const iconName = platformIcons[post.platform] ?? 'globe-outline';
  const statusColors: Record<string, string> = {
    scheduled: colors.brand,
    published: '#22C55E',
    failed: colors.destructive,
  };

  return (
    <View style={[styles.postRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.postPlatformIcon, { backgroundColor: `${colors.brand}12` }]}>
        <Ionicons name={iconName} size={18} color={colors.brand} />
      </View>
      <View style={styles.postInfo}>
        <Text numberOfLines={1} style={[styles.postTitle, { color: colors.foreground }]}>
          {post.title || post.description?.slice(0, 40) || 'Untitled post'}
        </Text>
        <Text style={[styles.postMeta, { color: colors.mutedForeground }]}>
          {post.platform} · {new Date(post.scheduledFor).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${statusColors[post.status]}18` }]}>
        <Text style={[styles.statusText, { color: statusColors[post.status] }]}>
          {post.status}
        </Text>
      </View>
    </View>
  );
}

// ... existing platformIcons and PostRow unchanged ...

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
    if (user && activeWorkspace) {
      fetchData();
    } else if (!activeWorkspace) {
      setLoading(false);
    }
  }, [user, activeWorkspace]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
      }
    >
      <WorkspaceSwitcher />

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          Hey, {displayName} 👋
        </Text>
        <Text style={[styles.greetingSub, { color: colors.mutedForeground }]}>
          Here's your {activeWorkspace?.name || 'social media'} overview
        </Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar-outline"
          label="Scheduled"
          value={stats.scheduled.toString()}
          trend={stats.scheduled > 0 ? `+${stats.scheduled} total` : undefined}
          trendUp
          colors={colors}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Published"
          value={stats.published.toString()}
          trend={stats.published > 0 ? `+${stats.published} total` : undefined}
          trendUp
          colors={colors}
        />
        <StatCard
          icon="people-outline"
          label="Followers"
          value="—"
          colors={colors}
        />
        <StatCard
          icon="pulse-outline"
          label="Engagement"
          value="—"
          colors={colors}
        />
      </View>

      {/* Upcoming posts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Posts</Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: colors.brand }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <GlassCard style={styles.emptyState} intensity={15}>
          <Ionicons name="calendar-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
          <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
            Create your first scheduled post from the Post tab
          </Text>
        </GlassCard>
      ) : (
        <GlassCard style={styles.postsCard} intensity={10}>
          {posts.map((post) => (
            <PostRow key={post.id} post={post} colors={colors} />
          ))}
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },
  greetingContainer: { marginBottom: Spacing.xl, marginTop: Spacing.sm },
  greeting: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.5 },
  greetingSub: { fontSize: FontSize.sm, marginTop: Spacing.xxs },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.base,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, marginTop: Spacing.xxs },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  trendText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  emptyState: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing['2xl'],
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  emptyDescription: { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 260 },
  postsCard: { borderRadius: Radius['2xl'], borderWidth: 1, overflow: 'hidden' },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  postPlatformIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postInfo: { flex: 1 },
  postTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  postMeta: { fontSize: FontSize.xs, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
});
