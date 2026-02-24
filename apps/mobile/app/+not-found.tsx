/**
 * 404 screen — shown when a route is not found
 */

import { Link, Stack } from 'expo-router';
import { StyleSheet, useColorScheme, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { Spacing, FontSize, FontWeight, Radius } from '@/constants/Theme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.mutedForeground} />
        <Text style={[styles.title, { color: colors.foreground }]}>Page not found</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          This screen doesn't exist.
        </Text>
        <Link href="/" style={[styles.link, { color: colors.brand }]}>
          Go to home screen
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  description: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  link: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
