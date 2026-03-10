import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView,
    useColorScheme, TextInput, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
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
    const insets = useSafeAreaInsets();

    const handleSwitch = async (id: string) => {
        await switchWorkspace(id);
        setModalVisible(false);
    };

    const closeModal = () => {
        setModalVisible(false);
        setShowCreate(false);
        setNewName('');
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

    const filteredWorkspaces = workspaces.filter(w => w.name !== 'Default Brand');

    return (
        <View style={styles.container}>
            {/* Trigger Button */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                style={[
                    styles.trigger,
                    {
                        backgroundColor: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                ]}
            >
                <View style={[styles.wsIcon, { backgroundColor: `${colors.brand}15` }]}>
                    <Ionicons name="grid" size={14} color={colors.brand} />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.label, { color: colors.mutedForeground }]}>WORKSPACE</Text>
                    <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                        {activeWorkspace?.name || 'Add New Brand'}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={closeModal}
                    >
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
                    </TouchableOpacity>

                    <View
                        style={[
                            styles.sheetContainer,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                paddingBottom: insets.bottom + 8,
                            },
                        ]}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandleRow}>
                            <View style={[styles.dragHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
                        </View>

                        {showCreate ? (
                            /* ── Create Workspace Form ── */
                            <View style={styles.sheetContent}>
                                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Create Workspace</Text>
                                <Text style={[styles.sheetDesc, { color: colors.mutedForeground }]}>
                                    Give your new brand a name. You can connect different social accounts to each workspace.
                                </Text>

                                <View style={{ gap: 6, marginTop: 8 }}>
                                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>NAME</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            {
                                                color: colors.foreground,
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                            },
                                        ]}
                                        placeholder="e.g. My Awesome Brand"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={newName}
                                        onChangeText={setNewName}
                                        autoFocus
                                        returnKeyType="done"
                                        onSubmitEditing={handleCreate}
                                    />
                                </View>

                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.secondaryBtn,
                                            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                                        ]}
                                        onPress={() => { setShowCreate(false); setNewName(''); }}
                                    >
                                        <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.primaryBtn,
                                            { backgroundColor: colors.brand, opacity: newName.trim() ? 1 : 0.4 },
                                        ]}
                                        onPress={handleCreate}
                                        disabled={!newName.trim() || creating}
                                    >
                                        {creating ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.primaryBtnText}>Create</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            /* ── Workspace List ── */
                            <View style={styles.sheetContent}>
                                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Your Brands</Text>

                                {filteredWorkspaces.length > 0 ? (
                                    <ScrollView
                                        style={styles.listScroll}
                                        showsVerticalScrollIndicator={false}
                                        bounces={false}
                                    >
                                        {filteredWorkspaces.map((item, index) => {
                                            const isActive = activeWorkspace?.id === item.id;
                                            const isLast = index === filteredWorkspaces.length - 1;
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[
                                                        styles.wsItem,
                                                        isActive && { backgroundColor: `${colors.brand}10` },
                                                        !isLast && {
                                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                                            borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                                        },
                                                    ]}
                                                    onPress={() => handleSwitch(item.id)}
                                                    activeOpacity={0.6}
                                                >
                                                    <View style={styles.wsItemLeft}>
                                                        <View
                                                            style={[
                                                                styles.wsItemIcon,
                                                                {
                                                                    backgroundColor: isActive
                                                                        ? `${colors.brand}18`
                                                                        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                                                },
                                                            ]}
                                                        >
                                                            <Ionicons
                                                                name="business"
                                                                size={16}
                                                                color={isActive ? colors.brand : colors.mutedForeground}
                                                            />
                                                        </View>
                                                        <Text
                                                            style={[
                                                                styles.wsName,
                                                                { color: colors.foreground },
                                                                isActive && { fontWeight: '700', color: colors.brand },
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            {item.name}
                                                        </Text>
                                                    </View>
                                                    {isActive && (
                                                        <Ionicons name="checkmark-circle" size={20} color={colors.brand} />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyState}>
                                        <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.brand}08` }]}>
                                            <Ionicons name="business-outline" size={28} color={colors.brand} />
                                        </View>
                                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workspaces yet</Text>
                                        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                                            Create your first workspace to start scheduling posts
                                        </Text>
                                    </View>
                                )}

                                {/* Add New Brand Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.addBtn,
                                        { backgroundColor: `${colors.brand}08` },
                                    ]}
                                    onPress={() => setShowCreate(true)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add-circle" size={20} color={colors.brand} />
                                    <Text style={[styles.addBtnText, { color: colors.brand }]}>Add New Brand</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 0.5,
    },
    wsIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    label: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
    name: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },

    // Bottom sheet overlay
    overlay: { flex: 1, justifyContent: 'flex-end' },

    // Sheet container
    sheetContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 180,
        maxHeight: '75%',
    },
    dragHandleRow: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 4,
    },
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    sheetContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.4,
        marginBottom: 16,
    },
    sheetDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },

    // Workspace list
    listScroll: {
        maxHeight: 320,
        marginBottom: 16,
    },
    wsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    wsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    wsItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    wsName: { fontSize: 16, fontWeight: '500', flex: 1 },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
    emptyIconCircle: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    emptyTitle: { fontSize: 17, fontWeight: '600' },
    emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

    // Add button
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 4,
    },
    addBtnText: { fontSize: 15, fontWeight: '600' },

    // Create form
    fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    formActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    secondaryBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: { fontSize: 15, fontWeight: '500' },
    primaryBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
