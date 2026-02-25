import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, useColorScheme, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
                                {activeWorkspace?.name || 'Loading...'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
                    </View>
                </GlassCard>
            </TouchableOpacity>

            <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]} />

                    <SafeAreaView style={styles.modalWrap}>
                        <GlassCard noPadding>
                            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Switch Workspace</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={24} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={workspaces}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.wsItem, activeWorkspace?.id === item.id && { backgroundColor: `${colors.brand}08` }]}
                                        onPress={() => handleSwitch(item.id)}
                                    >
                                        <Text style={[styles.wsName, { color: colors.foreground }]}>{item.name}</Text>
                                        {activeWorkspace?.id === item.id && (
                                            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => (
                                    <View style={[styles.sep, { backgroundColor: colors.border }]} />
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
    container: { marginBottom: 16 },
    trigger: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
    wsIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    label: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
    name: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalWrap: { width: '85%', maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    modalTitle: { fontSize: 16, fontWeight: '600' },
    wsItem: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    wsName: { fontSize: 15, fontWeight: '500' },
    sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
