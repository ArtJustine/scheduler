import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'glass' | 'destructive';
    icon?: React.ReactNode;
    disabled?: boolean;
}

export function GlassButton({ title, onPress, style, textStyle, variant = 'primary', icon, disabled }: GlassButtonProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                style={[styles.primary, { backgroundColor: colors.brand }, style]}
                onPress={onPress}
                activeOpacity={0.85}
                disabled={disabled}
            >
                <View style={styles.inner}>
                    {icon}
                    <Text style={[styles.primaryText, textStyle]}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (variant === 'destructive') {
        return (
            <TouchableOpacity
                style={[styles.secondary, { backgroundColor: `${colors.destructive}10`, borderColor: `${colors.destructive}20` }, style]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.inner}>
                    {icon}
                    <Text style={[styles.secondaryText, { color: colors.destructive }, textStyle]}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Secondary / glass
    return (
        <TouchableOpacity
            style={[styles.secondary, { backgroundColor: colors.accent, borderColor: colors.border }, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.inner}>
                {icon}
                <Text style={[styles.secondaryText, { color: colors.foreground }, textStyle]}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    primary: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    secondary: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderWidth: 1,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    secondaryText: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
});
