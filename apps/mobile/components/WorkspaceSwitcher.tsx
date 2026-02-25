import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, useColorScheme, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GlassCard } from './ui/GlassCard';
import Colors from '@/constants/Colors';

export function WorkspaceSwitcher() {
    const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    const handleSwitch = async (id: string) => {
        await switchWorkspace(id);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.85}
            >
                <GlassCard noPadding style={styles.card}>
                    <View style={styles.triggerContent}>
                        <View style={[styles.wsIcon, { backgroundColor: `${colors.brand}12` }]}>
                            <Ionicons name="grid" size={14} color={colors.brand} />
                        </View>
                        <View style={styles.info}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>WORKSPACE</Text>
                            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                                {activeWorkspace?.name || 'Loading...'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                    </View>
                </GlassCard>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)' }]} />

                    <SafeAreaView style={styles.modalContent}>
                        <GlassCard noPadding style={styles.modalCard}>
                            <View style={[styles.modalHeader, { borderBottomColor: `${colors.border}60` }]}>
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Switch Workspace</Text>
                                <TouchableOpacity
                                    style={[styles.closeBtn, { backgroundColor: `${colors.foreground}08` }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Ionicons name="close" size={18} color={colors.foreground} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={workspaces}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.workspaceItem,
                                            activeWorkspace?.id === item.id && { backgroundColor: `${colors.brand}10` }
                                        ]}
                                        onPress={() => handleSwitch(item.id)}
                                    >
                                        <View style={styles.workspaceInfo}>
                                            <Text style={[styles.workspaceName, { color: colors.foreground }]}>{item.name}</Text>
                                            {activeWorkspace?.id === item.id && (
                                                <View style={[styles.checkCircle, { backgroundColor: `${colors.brand}15` }]}>
                                                    <Ionicons name="checkmark" size={14} color={colors.brand} />
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => (
                                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                                )}
                            />
                        </GlassCard>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', marginBottom: 16 },
    trigger: { width: '100%' },
    card: {},
    triggerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    wsIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    label: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginBottom: 1 },
    name: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', maxHeight: '60%' },
    modalCard: {},
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
    },
    modalTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
    closeBtn: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    workspaceItem: { paddingHorizontal: 20, paddingVertical: 16 },
    workspaceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    workspaceName: { fontSize: 15, fontWeight: '600' },
    checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    separator: { height: 0.5, opacity: 0.3, marginHorizontal: 20 },
});
