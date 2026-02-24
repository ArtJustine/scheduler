/**
 * Modal screen — generic modal overlay
 */

import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, useColorScheme, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { Spacing, FontSize, FontWeight } from '@/constants/Theme';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Modal</Text>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  separator: {
    marginVertical: Spacing.xl,
    height: 1,
    width: '80%',
  },
});
