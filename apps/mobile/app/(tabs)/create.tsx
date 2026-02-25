/**
 * Create Post — clean iOS design with gradient background
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
    const isDark = colorScheme === 'dark';
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
            setMedia({ uri: result.assets[0].uri, type: result.assets[0].type === 'video' ? 'video' : 'image' });
        }
    };

    const handleCreate = async () => {
        if (!caption && !media) { Alert.alert('Error', 'Please add a caption or media'); return; }
        if (!activeWorkspace) { Alert.alert('Error', 'No active workspace'); return; }

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
            Alert.alert('Success', 'Post scheduled!', [{ text: 'OK', onPress: () => router.push('/(tabs)') }]);
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
        <View style={styles.container}>
            <LinearGradient
                colors={isDark ? ['#0A0A0A', '#0F1117', '#0A0A0A'] : ['#EDF4FD', '#F0ECFB', '#FDF2F0', '#FEFEFE']}
                locations={isDark ? [0, 0.5, 1] : [0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <WorkspaceSwitcher />

                <Text style={[styles.title, { color: colors.foreground }]}>Create Post</Text>

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
    inputCard: { marginBottom: 20, minHeight: 120 },
    input: { fontSize: 16, lineHeight: 22, textAlignVertical: 'top' },
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
