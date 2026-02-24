/**
 * useThemeColor — resolves a color from the Chiyu color palette
 * based on the current system appearance (light / dark).
 */

import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export function useThemeColor(
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
    props?: { light?: string; dark?: string },
): string {
    const scheme = useColorScheme() ?? 'light';
    const override = props?.[scheme];
    if (override) return override;
    return Colors[scheme][colorName];
}
