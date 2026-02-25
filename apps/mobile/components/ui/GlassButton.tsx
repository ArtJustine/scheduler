import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'glass' | 'destructive';
    icon?: React.ReactNode;
}

export function GlassButton({ title, onPress, style, textStyle, variant = 'primary', icon }: GlassButtonProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                style={[styles.button, style]}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={[colors.brand, `${colors.brand}DD`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Specular highlight on top of button */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'transparent']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <View style={styles.buttonInner}>
                    {icon}
                    <Text style={[styles.text, { color: '#FFFFFF' }, textStyle]}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (variant === 'destructive') {
        return (
            <TouchableOpacity
                style={[styles.glassButton, { borderColor: `${colors.destructive}30` }, style]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.destructive}08` }]} />
                <View style={styles.buttonInner}>
                    {icon}
                    <Text style={[styles.text, { color: colors.destructive }, textStyle]}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Glass / secondary variant
    const bg = isDark
        ? ['rgba(60, 60, 70, 0.5)', 'rgba(40, 40, 50, 0.4)']
        : ['rgba(255, 255, 255, 0.8)', 'rgba(240, 242, 248, 0.6)'];

    const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';

    return (
        <TouchableOpacity
            style={[styles.glassButton, { borderColor }, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={bg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={[isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.buttonInner}>
                {icon}
                <Text style={[styles.text, { color: colors.foreground }, textStyle]}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    glassButton: {
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
});
