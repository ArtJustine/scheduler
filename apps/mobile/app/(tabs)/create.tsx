import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    useColorScheme,
    Platform as RNPlatform,
    Switch,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import { getConnectedAccounts } from '@/lib/accounts';
import type { SocialAccountType, SocialAccount } from '@/types';

const PLATFORMS: { key: SocialAccountType; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; label: string }[] = [
    { key: 'instagram', icon: 'logo-instagram', color: '#E1306C', label: 'Instagram' },
    { key: 'tiktok', icon: 'logo-tiktok', color: '#010101', label: 'TikTok' },
    { key: 'youtube', icon: 'logo-youtube', color: '#FF0000', label: 'YouTube' },
    { key: 'facebook', icon: 'logo-facebook', color: '#1877F2', label: 'Facebook' },
    { key: 'twitter', icon: 'logo-twitter', color: '#1DA1F2', label: 'X' },
    { key: 'linkedin', icon: 'logo-linkedin', color: '#0A66C2', label: 'LinkedIn' },
    { key: 'threads', icon: 'at-outline', color: '#000000', label: 'Threads' },
    { key: 'bluesky', icon: 'cloud-outline', color: '#0085FF', label: 'Bluesky' },
];

const YOUTUBE_CATEGORIES = [
    { value: '22', label: 'People & Blogs' },
    { value: '10', label: 'Music' },
    { value: '23', label: 'Comedy' },
    { value: '24', label: 'Entertainment' },
    { value: '20', label: 'Gaming' },
    { value: '1', label: 'Film & Animation' },
    { value: '27', label: 'Education' },
    { value: '28', label: 'Science & Tech' },
];

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();
    const router = useRouter();

    // Core fields
    const [caption, setCaption] = useState('');
    const [media, setMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<SocialAccountType[]>([]);
    const [connectedPlatforms, setConnectedPlatforms] = useState<SocialAccountType[]>([]);

    // Scheduling (matching web app behavior)
    const [scheduledDate, setScheduledDate] = useState<Date>(() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 10);
        return d;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Format options
    const [format, setFormat] = useState<'vertical' | 'horizontal' | 'text'>('text');

    // Instagram-specific (matching web)
    const [instagramPostType, setInstagramPostType] = useState<'post' | 'reel'>('post');

    // TikTok-specific (matching web)
    const [tiktokPrivacy, setTiktokPrivacy] = useState<'public' | 'friends' | 'self'>('public');
    const [tiktokAllowComments, setTiktokAllowComments] = useState(true);
    const [tiktokAllowDuet, setTiktokAllowDuet] = useState(true);
    const [tiktokAllowStitch, setTiktokAllowStitch] = useState(true);

    // YouTube-specific (matching web)
    const [youtubeAspectRatio, setYoutubeAspectRatio] = useState<'9:16' | '16:9' | 'community'>('16:9');
    const [youtubeCategory, setYoutubeCategory] = useState('22');
    const [youtubeTags, setYoutubeTags] = useState('');
    const [youtubeMadeForKids, setYoutubeMadeForKids] = useState(false);
    const [youtubeAgeRestriction, setYoutubeAgeRestriction] = useState(false);

    // Threads-specific (matching web)
    const [threadsReplyPolicy, setThreadsReplyPolicy] = useState<'everyone' | 'followed' | 'mentioned'>('everyone');

    // LinkedIn-specific (matching web)
    const [linkedinVisibility, setLinkedinVisibility] = useState<'PUBLIC' | 'CONNECTIONS'>('PUBLIC');

    // Picker selection modals
    const [showTiktokPrivacyPicker, setShowTiktokPrivacyPicker] = useState(false);
    const [showYoutubeCategoryPicker, setShowYoutubeCategoryPicker] = useState(false);
    const [showYoutubeFormatPicker, setShowYoutubeFormatPicker] = useState(false);
    const [showThreadsReplyPicker, setShowThreadsReplyPicker] = useState(false);
    const [showLinkedinVisibilityPicker, setShowLinkedinVisibilityPicker] = useState(false);

    useEffect(() => {
        const fetchPlatforms = async () => {
            if (activeWorkspace) {
                const accounts = await getConnectedAccounts(activeWorkspace.id);
                const connected = Object.keys(accounts).filter(k => accounts[k as SocialAccountType]?.connected) as SocialAccountType[];
                setConnectedPlatforms(connected);

                try {
                    const savedFormat = await AsyncStorage.getItem('default_format');
                    const savedPlatforms = await AsyncStorage.getItem('default_platforms');

                    if (savedFormat) {
                        setFormat(savedFormat.toLowerCase() as any);
                    }

                    if (savedPlatforms) {
                        const parsed = JSON.parse(savedPlatforms) as string[];
                        const validPlatforms = parsed
                            .map(p => p.toLowerCase() as SocialAccountType)
                            .filter(p => connected.includes(p));

                        if (validPlatforms.length > 0) {
                            setSelectedPlatforms(validPlatforms);
                        } else if (connected.length > 0) {
                            setSelectedPlatforms([connected[0]]);
                        }
                    } else if (connected.length > 0) {
                        setSelectedPlatforms([connected[0]]);
                    }
                } catch (e) {
                    console.error('Error loading defaults in Create:', e);
                    if (connected.length > 0) setSelectedPlatforms([connected[0]]);
                }
            }
        };
        fetchPlatforms();
    }, [activeWorkspace]);

    useEffect(() => {
        if (!media) setFormat('text');
        else if (media.type === 'video') {
            setFormat('vertical');
            // Auto-switch to Reel if Instagram is selected
            if (selectedPlatforms.includes('instagram')) setInstagramPostType('reel');
        } else {
            setFormat('horizontal');
            if (selectedPlatforms.includes('instagram')) setInstagramPostType('post');
        }
    }, [media]);

    const togglePlatform = (key: SocialAccountType) => {
        setSelectedPlatforms(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        );
    };

    const pickMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'We need access to your photos.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        });
        if (!result.canceled) {
            setMedia({ uri: result.assets[0].uri, type: result.assets[0].type === 'video' ? 'video' : 'image' });
        }
    };

    const handleCreate = async () => {
        if (!caption && !media) { Alert.alert('Error', 'Please add a caption or media'); return; }
        if (!activeWorkspace) { Alert.alert('Error', 'No active workspace'); return; }
        if (selectedPlatforms.length === 0) { Alert.alert('Error', 'Select at least one platform'); return; }

        // Validation matching web app
        const isVideo = media?.type === 'video';
        const hasMedia = !!media;

        for (const platform of selectedPlatforms) {
            if (platform === 'instagram' && !hasMedia) {
                Alert.alert('Error', 'Instagram requires an image or video for all post types.');
                return;
            }
            if (platform === 'tiktok' && (!hasMedia || !isVideo)) {
                Alert.alert('Error', 'TikTok only accepts video files. Please upload a video.');
                return;
            }
            if (platform === 'pinterest' && !hasMedia) {
                Alert.alert('Error', 'Pinterest requires an image or video for all pins.');
                return;
            }
            if (platform === 'youtube' && youtubeAspectRatio !== 'community' && (!hasMedia || !isVideo)) {
                Alert.alert('Error', 'YouTube video/short posts require a video file.');
                return;
            }
        }

        // Validate future date
        if (scheduledDate < new Date()) {
            Alert.alert('Error', 'Please select a date and time in the future.');
            return;
        }

        setLoading(true);
        try {
            let mediaUrl = '';
            if (media) {
                const response = await fetch(media.uri);
                const blob = await response.blob();
                const filename = `posts/${user?.uid}/${Date.now()}`;
                const ref = storage.ref().child(filename);
                await ref.put(blob);
                mediaUrl = await ref.getDownloadURL();
            }

            // Build post data matching the web app's Firestore structure exactly
            const postData: Record<string, any> = {
                userId: user?.uid,
                workspaceId: activeWorkspace.id,
                title: caption.substring(0, 50) || 'New Post',
                description: caption.substring(0, 100) || 'Created from mobile',
                content: caption,
                mediaUrl,
                mediaType: media?.type || 'text',
                contentType: media?.type || 'text',
                status: 'scheduled',
                scheduledFor: scheduledDate.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                platforms: selectedPlatforms,
                platform: selectedPlatforms.length === 1 ? selectedPlatforms[0] : (selectedPlatforms.length > 1 ? 'multiple' : 'unknown'),
                format,
                aspectRatio: format === 'vertical' ? '9:16' : '16:9',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };

            // Add platform-specific fields (matching web app exactly)
            if (selectedPlatforms.includes('youtube')) {
                postData.youtubePostType = youtubeAspectRatio === 'community'
                    ? 'community'
                    : (mediaUrl ? (youtubeAspectRatio === '9:16' ? 'short' : 'video') : 'community');
                postData.youtubeOptions = {
                    madeForKids: youtubeMadeForKids,
                    ageRestriction: youtubeAgeRestriction,
                    tags: youtubeTags.split(',').map(t => t.trim()).filter(t => t),
                    category: youtubeCategory,
                };
            }

            if (selectedPlatforms.includes('instagram')) {
                postData.instagramPostType = instagramPostType;
            }

            if (selectedPlatforms.includes('tiktok')) {
                postData.tiktokOptions = {
                    privacy: tiktokPrivacy,
                    allowComments: tiktokAllowComments,
                    allowDuet: tiktokAllowDuet,
                    allowStitch: tiktokAllowStitch,
                };
            }

            if (selectedPlatforms.includes('threads')) {
                postData.threadsOptions = {
                    replyPolicy: threadsReplyPolicy,
                };
            }

            if (selectedPlatforms.includes('linkedin')) {
                postData.linkedinOptions = {
                    visibility: linkedinVisibility,
                };
            }

            console.log('Creating post with data:', JSON.stringify(postData, null, 2));
            await db.collection('posts').add(postData);

            Alert.alert('Success', 'Post scheduled!', [{ text: 'OK', onPress: () => router.push('/(tabs)') }]);
            setCaption('');
            setMedia(null);
            setSelectedPlatforms([]);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    // ─── Helper: Option Picker Modal ────────────────
    const PickerModal = ({
        visible,
        onClose,
        title,
        options,
        selected,
        onSelect,
    }: {
        visible: boolean;
        onClose: () => void;
        title: string;
        options: { value: string; label: string }[];
        selected: string;
        onSelect: (value: string) => void;
    }) => (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.foreground }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.modalOption, selected === opt.value && { backgroundColor: `${colors.brand}15` }]}
                            onPress={() => { onSelect(opt.value); onClose(); }}
                        >
                            <Text style={[styles.modalOptionText, { color: colors.foreground }]}>{opt.label}</Text>
                            {selected === opt.value && <Ionicons name="checkmark-circle" size={22} color={colors.brand} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const timezoneLabel = (() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const offset = -new Date().getTimezoneOffset() / 60;
            return `GMT${offset >= 0 ? '+' : ''}${offset} (${tz})`;
        } catch { return 'GMT+0'; }
    })();

    return (
        <View style={styles.container}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[styles.title, { color: colors.foreground }]}>Create Post</Text>

                {/* Platform Selector */}
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SELECT PLATFORMS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformScroll}>
                    {PLATFORMS.map((p) => {
                        const isConnected = connectedPlatforms.includes(p.key);
                        const isSelected = selectedPlatforms.includes(p.key);
                        return (
                            <TouchableOpacity
                                key={p.key}
                                style={[
                                    styles.platformBtn,
                                    isSelected && { borderColor: p.color, borderWidth: 2 },
                                    !isConnected && { opacity: 0.3 }
                                ]}
                                onPress={() => isConnected ? togglePlatform(p.key) : Alert.alert('Go to Connections', 'Connect this account first.')}
                            >
                                <View style={[styles.platformIcon, { backgroundColor: isSelected ? p.color : `${p.color}10` }]}>
                                    <Ionicons name={p.icon} size={20} color={isSelected ? '#fff' : p.color} />
                                </View>
                                <Text style={[styles.platformText, { color: isSelected ? p.color : colors.foreground }]}>{p.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Caption */}
                <GlassCard style={styles.inputCard}>
                    <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={colors.mutedForeground}
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                    />
                    <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{caption.length} / 500</Text>
                </GlassCard>

                {/* Media */}
                <TouchableOpacity onPress={pickMedia} activeOpacity={0.8}>
                    {media ? (
                        <View style={styles.previewWrap}>
                            <Image source={{ uri: media.uri }} style={styles.preview} />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => setMedia(null)}>
                                <View style={styles.removeCircle}>
                                    <Ionicons name="close" size={14} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.mediaPlaceholder, { borderColor: `${colors.border}` }]}>
                            <View style={[styles.mediaIconCircle, { backgroundColor: `${colors.brand}08` }]}>
                                <Ionicons name="image-outline" size={24} color={colors.brand} />
                            </View>
                            <Text style={[styles.mediaTitle, { color: colors.foreground }]}>Add media</Text>
                            <Text style={[styles.mediaSub, { color: colors.mutedForeground }]}>Photos or video</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* ─── Schedule Section (matching web) ─── */}
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SCHEDULE</Text>
                <GlassCard>
                    <View style={styles.scheduleRow}>
                        <View style={[styles.scheduleIconCircle, { backgroundColor: `${colors.brand}10` }]}>
                            <Ionicons name="calendar-outline" size={18} color={colors.brand} />
                        </View>
                        <TouchableOpacity style={styles.schedulePicker} onPress={() => setShowDatePicker(true)}>
                            <Text style={[styles.scheduleLabel, { color: colors.mutedForeground }]}>Date</Text>
                            <Text style={[styles.scheduleValue, { color: colors.foreground }]}>{formatDate(scheduledDate)}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.scheduleDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.scheduleRow}>
                        <View style={[styles.scheduleIconCircle, { backgroundColor: `${colors.brand}10` }]}>
                            <Ionicons name="time-outline" size={18} color={colors.brand} />
                        </View>
                        <TouchableOpacity style={styles.schedulePicker} onPress={() => setShowTimePicker(true)}>
                            <Text style={[styles.scheduleLabel, { color: colors.mutedForeground }]}>Time</Text>
                            <Text style={[styles.scheduleValue, { color: colors.foreground }]}>{formatTime(scheduledDate)}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.timezoneText, { color: colors.mutedForeground }]}>{timezoneLabel}</Text>
                </GlassCard>

                {showDatePicker && (
                    <DateTimePicker
                        value={scheduledDate}
                        mode="date"
                        display={RNPlatform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                        onChange={(event, date) => {
                            setShowDatePicker(RNPlatform.OS === 'ios');
                            if (date) {
                                const updated = new Date(scheduledDate);
                                updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                setScheduledDate(updated);
                            }
                        }}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={scheduledDate}
                        mode="time"
                        display={RNPlatform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            setShowTimePicker(RNPlatform.OS === 'ios');
                            if (date) {
                                const updated = new Date(scheduledDate);
                                updated.setHours(date.getHours(), date.getMinutes());
                                setScheduledDate(updated);
                            }
                        }}
                    />
                )}

                {/* ─── Instagram Settings ─── */}
                {selectedPlatforms.includes('instagram') && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>INSTAGRAM SETTINGS</Text>
                        <GlassCard>
                            <Text style={[styles.settingsSubtitle, { color: colors.foreground }]}>Post Type</Text>
                            <Text style={[styles.settingsHint, { color: colors.mutedForeground }]}>
                                {media?.type === 'video' ? 'Video detected → Reel' : media?.type === 'image' ? 'Image detected → Post' : 'Auto-detects from media'}
                            </Text>
                            <View style={styles.segmentRow}>
                                {(['post', 'reel'] as const).map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.segmentBtn,
                                            instagramPostType === type && { backgroundColor: `${colors.brand}15`, borderColor: colors.brand },
                                        ]}
                                        onPress={() => setInstagramPostType(type)}
                                    >
                                        <Text style={[styles.segmentText, { color: instagramPostType === type ? colors.brand : colors.mutedForeground }]}>
                                            {type === 'post' ? '📷 Post' : '🎬 Reel'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
                                Note: Instagram Stories are not supported via the Content Publishing API.
                            </Text>
                        </GlassCard>
                    </>
                )}

                {/* ─── TikTok Settings ─── */}
                {selectedPlatforms.includes('tiktok') && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TIKTOK SETTINGS</Text>
                        <GlassCard>
                            <View style={[styles.infoBar, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)' }]}>
                                <Ionicons name="information-circle" size={16} color="#3B82F6" />
                                <Text style={[styles.infoText, { color: '#3B82F6' }]}>Account must be set to Public in TikTok app settings.</Text>
                            </View>

                            <Text style={[styles.settingsSubtitle, { color: colors.foreground }]}>Privacy</Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, { borderColor: colors.border }]}
                                onPress={() => setShowTiktokPrivacyPicker(true)}
                            >
                                <Text style={[styles.pickerButtonText, { color: colors.foreground }]}>
                                    {tiktokPrivacy === 'public' ? 'Public (Everyone)' : tiktokPrivacy === 'friends' ? 'Friends Only' : 'Private (Only Me)'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>

                            <View style={styles.switchSection}>
                                <View style={styles.switchRow}>
                                    <Text style={[styles.switchLabel, { color: colors.foreground }]}>Allow Comments</Text>
                                    <Switch value={tiktokAllowComments} onValueChange={setTiktokAllowComments} trackColor={{ true: colors.brand }} />
                                </View>
                                <View style={styles.switchRow}>
                                    <Text style={[styles.switchLabel, { color: colors.foreground }]}>Allow Duet</Text>
                                    <Switch value={tiktokAllowDuet} onValueChange={setTiktokAllowDuet} trackColor={{ true: colors.brand }} />
                                </View>
                                <View style={styles.switchRow}>
                                    <Text style={[styles.switchLabel, { color: colors.foreground }]}>Allow Stitch</Text>
                                    <Switch value={tiktokAllowStitch} onValueChange={setTiktokAllowStitch} trackColor={{ true: colors.brand }} />
                                </View>
                            </View>
                        </GlassCard>
                    </>
                )}

                {/* ─── YouTube Settings ─── */}
                {selectedPlatforms.includes('youtube') && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUTUBE SETTINGS</Text>
                        <GlassCard>
                            <Text style={[styles.settingsSubtitle, { color: colors.foreground }]}>Category</Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, { borderColor: colors.border }]}
                                onPress={() => setShowYoutubeCategoryPicker(true)}
                            >
                                <Text style={[styles.pickerButtonText, { color: colors.foreground }]}>
                                    {YOUTUBE_CATEGORIES.find(c => c.value === youtubeCategory)?.label || 'Select'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>

                            <Text style={[styles.settingsSubtitle, { color: colors.foreground, marginTop: 16 }]}>Format</Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, { borderColor: colors.border }]}
                                onPress={() => setShowYoutubeFormatPicker(true)}
                            >
                                <Text style={[styles.pickerButtonText, { color: colors.foreground }]}>
                                    {youtubeAspectRatio === '9:16' ? 'Shorts (9:16)' : youtubeAspectRatio === '16:9' ? 'Video (16:9)' : 'Community Post'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>

                            <Text style={[styles.settingsSubtitle, { color: colors.foreground, marginTop: 16 }]}>Tags</Text>
                            <TextInput
                                style={[styles.tagInput, { color: colors.foreground, borderColor: colors.border }]}
                                placeholder="vlog, tutorial, funny (comma separated)"
                                placeholderTextColor={colors.mutedForeground}
                                value={youtubeTags}
                                onChangeText={setYoutubeTags}
                            />

                            <View style={styles.switchSection}>
                                <View style={styles.switchRow}>
                                    <View>
                                        <Text style={[styles.switchLabel, { color: colors.foreground }]}>Made for Kids</Text>
                                        <Text style={[styles.switchHint, { color: colors.mutedForeground }]}>Is this content for children?</Text>
                                    </View>
                                    <Switch value={youtubeMadeForKids} onValueChange={setYoutubeMadeForKids} trackColor={{ true: '#EF4444' }} />
                                </View>
                                <View style={styles.switchRow}>
                                    <View>
                                        <Text style={[styles.switchLabel, { color: colors.foreground }]}>Age Restricted</Text>
                                        <Text style={[styles.switchHint, { color: colors.mutedForeground }]}>18+ content only</Text>
                                    </View>
                                    <Switch value={youtubeAgeRestriction} onValueChange={setYoutubeAgeRestriction} trackColor={{ true: '#EF4444' }} />
                                </View>
                            </View>
                        </GlassCard>
                    </>
                )}

                {/* ─── Threads Settings ─── */}
                {selectedPlatforms.includes('threads') && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>THREADS SETTINGS</Text>
                        <GlassCard>
                            <Text style={[styles.settingsSubtitle, { color: colors.foreground }]}>Who can reply?</Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, { borderColor: colors.border }]}
                                onPress={() => setShowThreadsReplyPicker(true)}
                            >
                                <Text style={[styles.pickerButtonText, { color: colors.foreground }]}>
                                    {threadsReplyPolicy === 'everyone' ? 'Anyone' : threadsReplyPolicy === 'followed' ? 'Profiles you follow' : 'Only mentioned profiles'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </GlassCard>
                    </>
                )}

                {/* ─── LinkedIn Settings ─── */}
                {selectedPlatforms.includes('linkedin') && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LINKEDIN SETTINGS</Text>
                        <GlassCard>
                            <Text style={[styles.settingsSubtitle, { color: colors.foreground }]}>Visibility</Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, { borderColor: colors.border }]}
                                onPress={() => setShowLinkedinVisibilityPicker(true)}
                            >
                                <Text style={[styles.pickerButtonText, { color: colors.foreground }]}>
                                    {linkedinVisibility === 'PUBLIC' ? 'Anyone (Public)' : 'Connections only'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </GlassCard>
                    </>
                )}

                {/* Submit */}
                <View style={styles.actions}>
                    <GlassButton
                        title={loading ? 'Creating...' : 'Schedule Post'}
                        onPress={handleCreate}
                        variant="primary"
                        disabled={loading}
                        icon={!loading ? <Ionicons name="send" size={15} color="#fff" /> : undefined}
                    />
                    {loading && <ActivityIndicator style={{ marginTop: 16 }} color={colors.brand} />}
                </View>
            </ScrollView>

            {/* ─── Picker Modals ─── */}
            <PickerModal
                visible={showTiktokPrivacyPicker}
                onClose={() => setShowTiktokPrivacyPicker(false)}
                title="TikTok Privacy"
                options={[
                    { value: 'public', label: 'Public (Everyone)' },
                    { value: 'friends', label: 'Friends Only' },
                    { value: 'self', label: 'Private (Only Me)' },
                ]}
                selected={tiktokPrivacy}
                onSelect={(v) => setTiktokPrivacy(v as any)}
            />
            <PickerModal
                visible={showYoutubeCategoryPicker}
                onClose={() => setShowYoutubeCategoryPicker(false)}
                title="YouTube Category"
                options={YOUTUBE_CATEGORIES}
                selected={youtubeCategory}
                onSelect={setYoutubeCategory}
            />
            <PickerModal
                visible={showYoutubeFormatPicker}
                onClose={() => setShowYoutubeFormatPicker(false)}
                title="YouTube Format"
                options={[
                    { value: '9:16', label: 'Shorts (9:16)' },
                    { value: '16:9', label: 'Video (16:9)' },
                    { value: 'community', label: 'Community Post' },
                ]}
                selected={youtubeAspectRatio}
                onSelect={(v) => setYoutubeAspectRatio(v as any)}
            />
            <PickerModal
                visible={showThreadsReplyPicker}
                onClose={() => setShowThreadsReplyPicker(false)}
                title="Threads Reply Policy"
                options={[
                    { value: 'everyone', label: 'Anyone' },
                    { value: 'followed', label: 'Profiles you follow' },
                    { value: 'mentioned', label: 'Only mentioned profiles' },
                ]}
                selected={threadsReplyPolicy}
                onSelect={(v) => setThreadsReplyPolicy(v as any)}
            />
            <PickerModal
                visible={showLinkedinVisibilityPicker}
                onClose={() => setShowLinkedinVisibilityPicker(false)}
                title="LinkedIn Visibility"
                options={[
                    { value: 'PUBLIC', label: 'Anyone (Public)' },
                    { value: 'CONNECTIONS', label: 'Connections only' },
                ]}
                selected={linkedinVisibility}
                onSelect={(v) => setLinkedinVisibility(v as any)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, marginBottom: 20 },
    sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
    platformScroll: { marginBottom: 24, flexDirection: 'row' },
    platformBtn: { alignItems: 'center', marginRight: 12, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#00000000' },
    platformIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    platformText: { fontSize: 10, fontWeight: '600' },
    inputCard: { marginBottom: 20, minHeight: 120 },
    input: { fontSize: 16, lineHeight: 22, textAlignVertical: 'top', minHeight: 100 },
    charCount: { textAlign: 'right', fontSize: 11, fontWeight: '500', marginTop: 8 },
    mediaPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginBottom: 4,
        gap: 6,
    },
    mediaIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    mediaTitle: { fontSize: 15, fontWeight: '600' },
    mediaSub: { fontSize: 12 },
    previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
    preview: { width: '100%', height: 300, resizeMode: 'cover' },
    removeBtn: { position: 'absolute', top: 10, right: 10 },
    removeCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    actions: { marginTop: 8 },

    // Schedule
    scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    scheduleIconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    schedulePicker: { flex: 1 },
    scheduleLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
    scheduleValue: { fontSize: 16, fontWeight: '600' },
    scheduleDivider: { height: StyleSheet.hairlineWidth, marginLeft: 48, marginVertical: 8 },
    timezoneText: { fontSize: 10, marginTop: 8, textAlign: 'right' },

    // Platform Settings
    settingsSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    settingsHint: { fontSize: 11, marginBottom: 12 },
    segmentRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#00000010', alignItems: 'center' },
    segmentText: { fontSize: 13, fontWeight: '600' },
    noteText: { fontSize: 10, lineHeight: 14, marginTop: 4 },
    infoBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginBottom: 16 },
    infoText: { fontSize: 11, fontWeight: '500', flex: 1 },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 4,
    },
    pickerButtonText: { fontSize: 14, fontWeight: '500' },
    tagInput: {
        fontSize: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 4,
    },
    switchSection: { marginTop: 16, gap: 12 },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    switchLabel: { fontSize: 14, fontWeight: '500' },
    switchHint: { fontSize: 10, marginTop: 2 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
    modalOptionText: { fontSize: 15, fontWeight: '500' },
});
