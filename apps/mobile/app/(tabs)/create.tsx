/**
 * Create Post — iOS26 Liquid Glass aesthetic
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'expo-router';

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    const { activeWorkspace } = useWorkspace();
    const router = useRouter();

    const [caption, setCaption] = useState('');
    const [media, setMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
    const [loading, setLoading] = useState(false);

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
            setMedia({
                uri: result.assets[0].uri,
                type: result.assets[0].type === 'video' ? 'video' : 'image',
            });
        }
    };

    const handleCreate = async () => {
        if (!caption && !media) {
            Alert.alert('Error', 'Please add a caption or media');
            return;
        }
        if (!activeWorkspace) {
            Alert.alert('Error', 'No active workspace selected');
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

            await db.collection('posts').add({
                userId: user?.uid,
                workspaceId: activeWorkspace.id,
                description: caption,
                mediaUrl,
                mediaType: media?.type || 'text',
                status: 'scheduled',
                scheduledFor: new Date(Date.now() + 3600000).toISOString(),
                createdAt: new Date().toISOString(),
                platform: 'instagram',
            });

            Alert.alert('Success', 'Post scheduled!', [
                { text: 'OK', onPress: () => router.push('/(tabs)') },
            ]);
            setCaption('');
            setMedia(null);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
        >
            <WorkspaceSwitcher />

            <Text style={[styles.title, { color: colors.foreground }]}>Create Post</Text>

            {/* Caption */}
            <GlassCard style={styles.inputCard}>
                <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="What's on your mind?"
                    placeholderTextColor={`${colors.mutedForeground}90`}
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                />
            </GlassCard>

            {/* Media */}
            <TouchableOpacity onPress={pickMedia} activeOpacity={0.8} style={styles.mediaTrigger}>
                {media ? (
                    <View style={styles.previewWrap}>
                        <Image source={{ uri: media.uri }} style={styles.preview} />
                        <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
                            <View style={styles.removeCircle}>
                                <Ionicons name="close" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <GlassCard style={styles.mediaPlaceholder}>
                        <View style={[styles.mediaIconCircle, { backgroundColor: `${colors.brand}12` }]}>
                            <Ionicons name="image-outline" size={28} color={colors.brand} />
                        </View>
                        <Text style={[styles.mediaTitle, { color: colors.foreground }]}>Add photos or video</Text>
                        <Text style={[styles.mediaSubtext, { color: colors.mutedForeground }]}>
                            Tap to select from your library
                        </Text>
                    </GlassCard>
                )}
            </TouchableOpacity>

            {/* Submit */}
            <View style={styles.actions}>
                <GlassButton
                    title={loading ? 'Creating...' : 'Schedule Post'}
                    onPress={handleCreate}
                    variant="primary"
                    icon={!loading ? <Ionicons name="send" size={16} color="#fff" /> : undefined}
                />
                {loading && <ActivityIndicator style={{ marginTop: 16 }} color={colors.brand} />}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    title: { fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 20 },
    inputCard: { marginBottom: 20, minHeight: 130 },
    input: { fontSize: 16, lineHeight: 22, textAlignVertical: 'top' },
    mediaTrigger: { marginBottom: 28 },
    mediaPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 10,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: 'rgba(112, 165, 238, 0.25)',
        borderRadius: 22,
    },
    mediaIconCircle: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    mediaTitle: { fontSize: 15, fontWeight: '700' },
    mediaSubtext: { fontSize: 12, opacity: 0.6 },
    previewWrap: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    preview: { width: '100%', height: 320, resizeMode: 'cover' },
    removeMedia: { position: 'absolute', top: 12, right: 12 },
    removeCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: { marginTop: 4 },
});
