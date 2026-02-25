import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'glass';
}

export function GlassButton({ title, onPress, style, textStyle, variant = 'primary' }: GlassButtonProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.brand }, style]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text style={[styles.text, { color: '#FFFFFF' }, textStyle]}>{title}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.glassButton, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <BlurView
                intensity={30}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.text, { color: colors.foreground }, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    glassButton: {
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
});
