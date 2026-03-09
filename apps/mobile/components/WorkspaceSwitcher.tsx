import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, Modal, FlatList,
    useColorScheme, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from './ui/GlassCard';
import Colors from '@/constants/Colors';
import { db } from '@/lib/firebase';

export function WorkspaceSwitcher() {
    const { user } = useAuth();
    const { activeWorkspace, workspaces, switchWorkspace, refreshWorkspaces } = useWorkspace();
    const [modalVisible, setModalVisible] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    const handleSwitch = async (id: string) => {
        await switchWorkspace(id);
        setModalVisible(false);
    };

    const handleCreate = async () => {
        if (!user || !newName.trim()) return;
        setCreating(true);
        try {
            const docRef = await db.collection('workspaces').add({
                name: newName.trim(),
                ownerId: user.uid,
                memberIds: [user.uid],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                accounts: {},
            });
            // Set as active
            await db.collection('users').doc(user.uid).set(
                { activeWorkspaceId: docRef.id },
                { merge: true }
            );
            setNewName('');
            setShowCreate(false);
            await refreshWorkspaces();
            setModalVisible(false);
        } catch (error) {
            console.error('Error creating workspace:', error);
            Alert.alert('Error', 'Could not create workspace. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    // Filter out "Default Brand" placeholders (matching web app behavior)
    const filteredWorkspaces = workspaces.filter(w => w.name !== 'Default Brand');

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <GlassCard noPadding>
                    <View style={styles.trigger}>
                        <View style={[styles.wsIcon, { backgroundColor: `${colors.brand}10` }]}>
                            <Ionicons name="grid" size={14} color={colors.brand} />
                        </View>
                        <View style={styles.info}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>WORKSPACE</Text>
                            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                                {activeWorkspace?.name || 'Add New Brand'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
                    </View>
                </GlassCard>
            </TouchableOpacity>

            <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => { setModalVisible(false); setShowCreate(false); }}>
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => { setModalVisible(false); setShowCreate(false); }}
                >
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]} />

                    <SafeAreaView style={styles.modalWrap}>
                        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                            <GlassCard noPadding>
                                {/* Header */}
                                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                                        {showCreate ? 'Create Workspace' : 'Your Brands'}
                                    </Text>
                                    <TouchableOpacity onPress={() => { setModalVisible(false); setShowCreate(false); }}>
                                        <Ionicons name="close-circle" size={24} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>

                                {showCreate ? (
                                    /* ── Create Workspace Form ── */
                                    <View style={styles.createForm}>
                                        <Text style={[styles.createDesc, { color: colors.mutedForeground }]}>
                                            Give your new brand/workspace a name. You can connect completely different social accounts here.
                                        </Text>
                                        <Text style={[styles.createLabel, { color: colors.foreground }]}>Workspace Name</Text>
                                        <TextInput
                                            style={[styles.createInput, {
                                                color: colors.foreground,
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                                borderColor: colors.border,
                                            }]}
                                            placeholder="e.g. My Awesome Brand"
                                            placeholderTextColor={colors.mutedForeground}
                                            value={newName}
                                            onChangeText={setNewName}
                                            autoFocus
                                            returnKeyType="done"
                                            onSubmitEditing={handleCreate}
                                        />
                                        <View style={styles.createButtons}>
                                            <TouchableOpacity
                                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                                onPress={() => { setShowCreate(false); setNewName(''); }}
                                            >
                                                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.createBtn, {
                                                    backgroundColor: colors.brand,
                                                    opacity: newName.trim() ? 1 : 0.4,
                                                }]}
                                                onPress={handleCreate}
                                                disabled={!newName.trim() || creating}
                                            >
                                                {creating ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <Text style={styles.createBtnText}>Create Workspace</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    /* ── Workspace List ── */
                                    <>
                                        {filteredWorkspaces.length > 0 ? (
                                            <FlatList
                                                data={filteredWorkspaces}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={[styles.wsItem, activeWorkspace?.id === item.id && { backgroundColor: `${colors.brand}08` }]}
                                                        onPress={() => handleSwitch(item.id)}
                                                    >
                                                        <View style={styles.wsItemLeft}>
                                                            <View style={[
                                                                styles.wsItemIcon,
                                                                {
                                                                    backgroundColor: activeWorkspace?.id === item.id
                                                                        ? `${colors.brand}15`
                                                                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                                                },
                                                            ]}>
                                                                <Ionicons
                                                                    name="business"
                                                                    size={16}
                                                                    color={activeWorkspace?.id === item.id ? colors.brand : colors.mutedForeground}
                                                                />
                                                            </View>
                                                            <Text style={[
                                                                styles.wsName,
                                                                { color: colors.foreground },
                                                                activeWorkspace?.id === item.id && { fontWeight: '700' },
                                                            ]}>
                                                                {item.name}
                                                            </Text>
                                                        </View>
                                                        {activeWorkspace?.id === item.id && (
                                                            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                                ItemSeparatorComponent={() => (
                                                    <View style={[styles.sep, { backgroundColor: colors.border }]} />
                                                )}
                                            />
                                        ) : (
                                            <View style={styles.emptyState}>
                                                <Ionicons name="business-outline" size={32} color={colors.mutedForeground} />
                                                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workspaces yet</Text>
                                                <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                                                    Create your first workspace to start scheduling posts
                                                </Text>
                                            </View>
                                        )}

                                        {/* ── Add New Brand Button ── */}
                                        <View style={[styles.addBtnWrap, { borderTopColor: colors.border }]}>
                                            <TouchableOpacity
                                                style={styles.addBtn}
                                                onPress={() => setShowCreate(true)}
                                            >
                                                <View style={[styles.addBtnIcon, { backgroundColor: `${colors.brand}10` }]}>
                                                    <Ionicons name="add" size={18} color={colors.brand} />
                                                </View>
                                                <Text style={[styles.addBtnText, { color: colors.brand }]}>Add New Brand</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </GlassCard>
                        </TouchableOpacity>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    trigger: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
    wsIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    label: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
    name: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalWrap: { width: '85%', maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    modalTitle: { fontSize: 16, fontWeight: '700' },
    wsItem: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    wsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    wsItemIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    wsName: { fontSize: 15, fontWeight: '500' },
    sep: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, gap: 6 },
    emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 4 },
    emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
    // Add button
    addBtnWrap: { borderTopWidth: StyleSheet.hairlineWidth, padding: 12 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
    addBtnIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    addBtnText: { fontSize: 14, fontWeight: '600' },
    // Create form
    createForm: { padding: 16, gap: 12 },
    createDesc: { fontSize: 13, lineHeight: 18 },
    createLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    createInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
    createButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
    cancelBtnText: { fontSize: 14, fontWeight: '500' },
    createBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    createBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
