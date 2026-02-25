import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, useColorScheme, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkspace } from '@/context/WorkspaceContext';
import { GlassCard } from './ui/GlassCard';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

export function WorkspaceSwitcher() {
    const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const handleSwitch = async (id: string) => {
        await switchWorkspace(id);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <GlassCard style={styles.card} intensity={25}>
                    <View style={styles.triggerContent}>
                        <View style={styles.info}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>Workspace</Text>
                            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                                {activeWorkspace?.name || 'Loading...'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
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
                    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

                    <SafeAreaView style={styles.modalContent}>
                        <GlassCard style={styles.modalCard} intensity={80}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Switch Workspace</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.foreground} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={workspaces}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.workspaceItem,
                                            activeWorkspace?.id === item.id && { backgroundColor: colors.brand + '15' }
                                        ]}
                                        onPress={() => handleSwitch(item.id)}
                                    >
                                        <View style={styles.workspaceInfo}>
                                            <Text style={[styles.workspaceName, { color: colors.foreground }]}>{item.name}</Text>
                                            {activeWorkspace?.id === item.id && (
                                                <Ionicons name="checkmark-circle" size={20} color={colors.brand} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
                            />
                        </GlassCard>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    trigger: {
        width: '100%',
    },
    card: {
        padding: 0,
    },
    triggerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '70%',
    },
    modalCard: {
        padding: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    workspaceItem: {
        padding: 20,
    },
    workspaceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workspaceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        opacity: 0.1,
    },
});
