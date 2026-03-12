import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    Alert,
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { getUserBioProfile, saveBioProfile, isUsernameAvailable, type BioLink } from '@/lib/link-in-bio';

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export default function BioScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [links, setLinks] = useState<BioLink[]>([]);
    
    const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'settings'>('links');

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            try {
                const profile = await getUserBioProfile(user.uid);
                if (profile) {
                    setUsername(profile.username || '');
                    setDisplayName(profile.displayName || '');
                    setBio(profile.bio || '');
                    setLinks(profile.links || []);
                }
            } catch (error) {
                console.error('Failed to load bio profile', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            if (username.trim()) {
                const available = await isUsernameAvailable(username.trim().toLowerCase(), user.uid);
                if (!available) {
                    Alert.alert('Error', 'Username is already taken');
                    setSaving(false);
                    return;
                }
            }

            const profileData = {
                username: username.trim().toLowerCase(),
                displayName: displayName.trim(),
                bio: bio.trim(),
                links: links,
            };

            await saveBioProfile(user.uid, profileData);
            Alert.alert('Success', 'Profile saved successfully!');
        } catch (error) {
            console.error('Failed to save bio profile', error);
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (type: 'link' | 'heading' | 'subheading' | 'social') => {
        const newBlock: BioLink = {
            id: generateId(),
            title: type === 'link' ? '' : (type === 'heading' ? 'New Heading' : (type === 'subheading' ? 'New Subheading' : 'instagram')),
            url: type === 'social' || type === 'link' ? 'https://' : '',
            enabled: true,
            type: type,
            platform: type === 'social' ? 'instagram' : undefined,
            layout: type === 'heading' || type === 'subheading' ? 'center' : 'classic',
            fontColor: type === 'social' ? '#ffffff' : '#000000',
            backgroundColor: type === 'social' ? '#000000' : '#ffffff',
        };
        setLinks([newBlock, ...links]);
    };

    const updateLink = (id: string, updates: Partial<BioLink>) => {
        setLinks(links.map(link => link.id === id ? { ...link, ...updates } : link));
    };

    const removeLink = (id: string) => {
        setLinks(links.filter(link => link.id !== id));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newLinks = [...links];
        const temp = newLinks[index];
        newLinks[index] = newLinks[index - 1];
        newLinks[index - 1] = temp;
        setLinks(newLinks);
    };

    const moveDown = (index: number) => {
        if (index === links.length - 1) return;
        const newLinks = [...links];
        const temp = newLinks[index];
        newLinks[index] = newLinks[index + 1];
        newLinks[index + 1] = temp;
        setLinks(newLinks);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.foreground }}>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
            
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Link-in-Bio</Text>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.tabs, { backgroundColor: `${colors.brand}15` }]}>
                {(['links', 'appearance', 'settings'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && { backgroundColor: colors.brand }]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : colors.brand }]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'links' && (
                    <View style={styles.tabContent}>
                        <View style={styles.addButtonsRow}>
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.brand }]} onPress={() => addBlock('link')}>
                                <Ionicons name="link" size={16} color="#fff" />
                                <Text style={styles.addBtnText}>Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.brand }]} onPress={() => addBlock('heading')}>
                                <Ionicons name="text" size={16} color="#fff" />
                                <Text style={styles.addBtnText}>Heading</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.brand }]} onPress={() => addBlock('social')}>
                                <Ionicons name="logo-instagram" size={16} color="#fff" />
                                <Text style={styles.addBtnText}>Social</Text>
                            </TouchableOpacity>
                        </View>

                        {links.map((link, index) => (
                            <GlassCard key={link.id} style={styles.blockCard}>
                                <View style={styles.blockHeader}>
                                    <View style={styles.blockTypeBadge}>
                                        <Text style={styles.blockTypeText}>{link.type?.toUpperCase() || 'LINK'}</Text>
                                    </View>
                                    <View style={styles.blockControls}>
                                        <TouchableOpacity onPress={() => moveUp(index)}>
                                            <Ionicons name="arrow-up" size={20} color={colors.mutedForeground} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => moveDown(index)}>
                                            <Ionicons name="arrow-down" size={20} color={colors.mutedForeground} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeLink(link.id)} style={{ marginLeft: 8 }}>
                                            <Ionicons name="trash" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {(link.type === 'heading' || link.type === 'subheading') && (
                                    <TextInput
                                        style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                                        value={link.title}
                                        onChangeText={(v) => updateLink(link.id, { title: v })}
                                        placeholder="Heading Text"
                                        placeholderTextColor={colors.mutedForeground}
                                    />
                                )}

                                {link.type === 'social' && (
                                    <View style={{ gap: 8 }}>
                                        <TextInput
                                            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                                            value={link.platform || ''}
                                            onChangeText={(v) => updateLink(link.id, { platform: v, title: v })}
                                            placeholder="Platform (e.g. instagram)"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                        <TextInput
                                            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                                            value={link.url}
                                            onChangeText={(v) => updateLink(link.id, { url: v })}
                                            placeholder="https://social.com/username"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                )}

                                {(!link.type || link.type === 'link') && (
                                    <View style={{ gap: 8 }}>
                                        <TextInput
                                            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                                            value={link.title}
                                            onChangeText={(v) => updateLink(link.id, { title: v })}
                                            placeholder="Link Title"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                        <TextInput
                                            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                                            value={link.url}
                                            onChangeText={(v) => updateLink(link.id, { url: v })}
                                            placeholder="https://your-link.com"
                                            keyboardType="url"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                )}
                                
                                <View style={styles.enabledRow}>
                                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '500' }}>Enabled</Text>
                                    <Switch
                                        value={link.enabled}
                                        onValueChange={(val) => updateLink(link.id, { enabled: val })}
                                        trackColor={{ false: colors.border, true: colors.brand }}
                                    />
                                </View>
                            </GlassCard>
                        ))}
                        {links.length === 0 && (
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                You haven't added any blocks yet.
                            </Text>
                        )}
                    </View>
                )}

                {activeTab === 'settings' && (
                    <View style={styles.tabContent}>
                        <GlassCard>
                            <Text style={[styles.label, { color: colors.foreground }]}>Username Handle</Text>
                            <TextInput
                                style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 16 }]}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="e.g. yourbrand"
                                placeholderTextColor={colors.mutedForeground}
                            />
                            
                            <Text style={[styles.label, { color: colors.foreground }]}>Display Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 16 }]}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Your Name or Brand"
                                placeholderTextColor={colors.mutedForeground}
                            />

                            <Text style={[styles.label, { color: colors.foreground }]}>Bio</Text>
                            <TextInput
                                style={[styles.inputArea, { color: colors.foreground, borderColor: colors.border }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="A short description about you"
                                multiline
                                textAlignVertical="top"
                                placeholderTextColor={colors.mutedForeground}
                            />
                        </GlassCard>
                    </View>
                )}

                {activeTab === 'appearance' && (
                    <View style={styles.tabContent}>
                         <GlassCard>
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                Basic appearance settings synced from web app. More styling options are coming to the mobile app soon!
                            </Text>
                        </GlassCard>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    saveBtn: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    tabs: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 16 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    tabText: { fontSize: 13, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    tabContent: { gap: 16 },
    addButtonsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    blockCard: { padding: 16, gap: 12 },
    blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    blockTypeBadge: { backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    blockTypeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    blockControls: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    inputArea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 80 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    enabledRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    emptyText: { textAlign: 'center', marginTop: 32, fontSize: 14 },
});
