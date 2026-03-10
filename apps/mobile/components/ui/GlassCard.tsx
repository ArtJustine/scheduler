import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    noPadding?: boolean;
    variant?: 'default' | 'flat'; // flat = no shadow, for list items inside scrolls
}

/**
 * Clean card component — solid background with subtle shadow.
 * NOT frosted glass. Content cards should be clean and readable.
 * Glass effects are reserved for the tab bar / headers only.
 */
export function GlassCard({ children, style, noPadding, variant = 'default' }: GlassCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';

    return (
        <View
            style={[
                styles.card,
                variant === 'default' && (isDark ? styles.shadowDark : styles.shadowLight),
                {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    // Border removed to prevent nested rounded rectangle outlines
                    borderWidth: 0,
                },
                style,
            ]}
        >
            <View style={noPadding ? undefined : styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    shadowLight: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    shadowDark: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    content: {
        padding: 16,
    },
});
