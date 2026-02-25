import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number; // kept for API compat but not used by new design
    glassColor?: string; // optional tint
    noPadding?: boolean;
}

export function GlassCard({ children, style, glassColor, noPadding }: GlassCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';

    const bg = isDark
        ? ['rgba(40, 40, 50, 0.65)', 'rgba(30, 30, 40, 0.55)']
        : ['rgba(255, 255, 255, 0.72)', 'rgba(245, 247, 252, 0.58)'];

    const borderColor = isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(255, 255, 255, 0.85)';

    const highlightColor = isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(255, 255, 255, 0.95)';

    return (
        <View style={[styles.outerShadow, style]}>
            <View style={[styles.container, { borderColor }]}>
                {/* Glass background gradient */}
                <LinearGradient
                    colors={glassColor ? [`${glassColor}18`, `${glassColor}08`] : bg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Top specular highlight — the "liquid glass" shine */}
                <LinearGradient
                    colors={[highlightColor, 'transparent']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.45 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                />
                <View style={noPadding ? undefined : styles.content}>
                    {children}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerShadow: {
        // Layer 1: soft ambient shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
    },
    container: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        // Layer 2: tighter shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    content: {
        padding: 16,
    },
});
