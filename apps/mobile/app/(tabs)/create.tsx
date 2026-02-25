import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
];

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();
    const router = useRouter();

    const [caption, setCaption] = useState('');
    const [media, setMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<SocialAccountType[]>([]);
    const [connectedPlatforms, setConnectedPlatforms] = useState<SocialAccountType[]>([]);

    // Format options
    const [format, setFormat] = useState<'vertical' | 'horizontal' | 'text'>('text');
    const [postType, setPostType] = useState<string>('post'); // post, reel, story, short, etc.

    useEffect(() => {
        const fetchPlatforms = async () => {
            if (activeWorkspace) {
                const accounts = await getConnectedAccounts(activeWorkspace.id);
                const connected = Object.keys(accounts).filter(k => accounts[k as SocialAccountType]?.connected) as SocialAccountType[];
                setConnectedPlatforms(connected);

                // Load defaults from AsyncStorage
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
        else if (media.type === 'video') setFormat('vertical');
        else setFormat('horizontal');
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

            // In our system, multi-platform posts are handled by creating one entry with a "platforms" array
            // or separate entries. The current web app seems to use separate entries or a "platforms" field.
            // Let's match the web app's structure: platforms: string[], contentType: string, etc.

            await db.collection('posts').add({
                userId: user?.uid,
                workspaceId: activeWorkspace.id,
                description: caption,
                content: caption,
                mediaUrl,
                mediaType: media?.type || 'text',
                contentType: media?.type || 'text',
                status: 'scheduled',
                scheduledFor: new Date(Date.now() + 3600000).toISOString(),
                createdAt: new Date().toISOString(),
                platforms: selectedPlatforms,
                platform: selectedPlatforms[0], // primary platform
                format,
                postType,
                aspectRatio: format === 'vertical' ? '9:16' : '16:9',
            });

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
                </GlassCard>

                {/* Format / Type */}
                {(selectedPlatforms.includes('instagram') || selectedPlatforms.includes('youtube')) && (
                    <View style={styles.formatSection}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>POST FORMAT</Text>
                        <View style={styles.formatRow}>
                            {['text', 'vertical', 'horizontal'].map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.formatBtn, format === f && { backgroundColor: `${colors.brand}15`, borderColor: colors.brand }]}
                                    onPress={() => setFormat(f as any)}
                                >
                                    <Text style={[styles.formatText, { color: format === f ? colors.brand : colors.mutedForeground }]}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, marginBottom: 20 },
    sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
    platformScroll: { marginBottom: 24, flexDirection: 'row' },
    platformBtn: { alignItems: 'center', marginRight: 12, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#00000000' },
    platformIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    platformText: { fontSize: 10, fontWeight: '600' },
    inputCard: { marginBottom: 20, minHeight: 120 },
    input: { fontSize: 16, lineHeight: 22, textAlignVertical: 'top' },
    formatSection: { marginBottom: 24 },
    formatRow: { flexDirection: 'row', gap: 10 },
    formatBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#00000010', alignItems: 'center' },
    formatText: { fontSize: 13, fontWeight: '600' },
    mediaPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginBottom: 24,
        gap: 6,
    },
    mediaIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    mediaTitle: { fontSize: 15, fontWeight: '600' },
    mediaSub: { fontSize: 12 },
    previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
    preview: { width: '100%', height: 300, resizeMode: 'cover' },
    removeBtn: { position: 'absolute', top: 10, right: 10 },
    removeCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    actions: {},
});
