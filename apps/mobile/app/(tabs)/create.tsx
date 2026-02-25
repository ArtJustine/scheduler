import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'expo-router';

export default function CreatePostScreen() {
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
            Alert.alert('Permission denied', 'We need access to your photos to upload media.');
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
                // Simplified upload logic for beta
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
                scheduledFor: new Date(Date.now() + 3600000).toISOString(), // Default 1 hour from now
                createdAt: new Date().toISOString(),
                platform: 'instagram', // Default for beta
            });

            Alert.alert('Success', 'Post scheduled successfully!', [
                { text: 'OK', onPress: () => router.push('/(tabs)') }
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
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <WorkspaceSwitcher />

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.foreground }]}>Create Post</Text>

                <GlassCard style={styles.inputCard} intensity={15}>
                    <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={colors.mutedForeground}
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                    />
                </GlassCard>

                <TouchableOpacity onPress={pickMedia} activeOpacity={0.7} style={styles.mediaTrigger}>
                    {media ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: media.uri }} style={styles.preview} />
                            <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
                                <Ionicons name="close-circle" size={28} color="#FF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <GlassCard style={styles.mediaPlaceholder} intensity={10}>
                            <Ionicons name="image-outline" size={40} color={colors.brand} />
                            <Text style={[styles.mediaText, { color: colors.mutedForeground }]}>Add photos or video</Text>
                        </GlassCard>
                    )}
                </TouchableOpacity>

                <View style={styles.actions}>
                    <GlassButton
                        title={loading ? 'Creating...' : 'Schedule Post'}
                        onPress={handleCreate}
                        variant="primary"
                    />
                    {loading && <ActivityIndicator style={{ marginTop: 10 }} color={colors.brand} />}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 20,
    },
    inputCard: {
        minHeight: 120,
        marginBottom: 20,
    },
    input: {
        fontSize: 16,
        padding: 4,
        textAlignVertical: 'top',
    },
    mediaTrigger: {
        marginBottom: 30,
    },
    mediaPlaceholder: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: 'rgba(124, 91, 255, 0.3)',
    },
    mediaText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
    previewContainer: {
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
    },
    preview: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    removeMedia: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 14,
    },
    actions: {
        marginTop: 10,
    },
});
