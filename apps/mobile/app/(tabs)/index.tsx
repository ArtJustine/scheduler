/**
 * Dashboard — clean iOS design with vibrant gradient background.
 * Glass effect comes from the tab bar / header refracting this gradient.
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
  accent,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  accent: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: `${accent}12` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
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

function PostRow({ post, colors, isLast }: { post: PostType; colors: (typeof Colors)['light']; isLast?: boolean }) {
  const platformKey = post.platforms?.[0] || post.platform;
  const iconName = platformIcons[platformKey] ?? 'globe-outline';
  const statusMap: Record<string, { color: string; label: string }> = {
    scheduled: { color: colors.brand, label: 'Scheduled' },
    published: { color: '#34C759', label: 'Published' },
    failed: { color: '#FF3B30', label: 'Failed' },
    partial: { color: '#FF9500', label: 'Partial' },
    publishing: { color: '#AF52DE', label: 'Publishing' },
  };
  const status = statusMap[post.status] ?? { color: colors.mutedForeground, label: post.status };

  return (
    <View style={[styles.postRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[styles.postPlatformIcon, { backgroundColor: `${colors.brand}08` }]}>
        <Ionicons name={iconName} size={16} color={colors.mutedForeground} />
      </View>
      <View style={styles.postContent}>
        <Text numberOfLines={1} style={[styles.postTitle, { color: colors.foreground }]}>
          {post.title || post.description?.slice(0, 50) || 'Untitled post'}
        </Text>
        <Text style={[styles.postDate, { color: colors.mutedForeground }]}>
          {new Date(post.scheduledFor).toLocaleDateString()} · {post.platform}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${status.color}12` }]}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
}

// ── Main dashboard ──────────────────────────────────────────────

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
        getPostStats(activeWorkspace.id),
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
      <View style={[styles.container, styles.centered]}>
        <LinearGradient colors={isDark ? ['#0A0A0A', '#0A0A0A'] : ['#EDF4FD', '#F0ECFB', '#FEFEFE']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vibrant gradient background — this is what the tab bar refracts */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        <WorkspaceSwitcher />

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, { color: colors.foreground }]}>
            Hey, {displayName} 👋
          </Text>
          <Text style={[styles.greetingSub, { color: colors.mutedForeground }]}>
            Here's your {activeWorkspace?.name || 'social'} overview
          </Text>
        </View>

        {/* Stats row */}
        <GlassCard noPadding style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatCard icon="calendar" label="Scheduled" value={stats.scheduled.toString()} accent={colors.brand} colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatCard icon="checkmark-circle" label="Published" value={stats.published.toString()} accent="#34C759" colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatCard icon="people" label="Followers" value="—" accent="#AF52DE" colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatCard icon="pulse" label="Engagement" value="—" accent="#FF9500" colors={colors} />
          </View>
        </GlassCard>

        {/* Upcoming posts */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Posts</Text>
          {posts.length > 0 && (
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.brand }]}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {posts.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.brand}08` }]}>
              <Ionicons name="calendar-outline" size={28} color={colors.brand} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Create your first scheduled post from the Post tab
            </Text>
          </GlassCard>
        ) : (
          <GlassCard noPadding>
            {posts.map((post, i) => (
              <PostRow key={post.id} post={post} colors={colors} isLast={i === posts.length - 1} />
            ))}
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  greeting: { marginBottom: 20 },
  greetingTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  greetingSub: { fontSize: 14, marginTop: 4 },

  statsCard: { marginBottom: 28 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statIconCircle: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 40, opacity: 0.5 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  seeAll: { fontSize: 14, fontWeight: '500' },

  emptyCard: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyDesc: { fontSize: 13, textAlign: 'center', maxWidth: 240, lineHeight: 18 },

  postRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  postPlatformIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  postContent: { flex: 1 },
  postTitle: { fontSize: 14, fontWeight: '500', letterSpacing: -0.1 },
  postDate: { fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
