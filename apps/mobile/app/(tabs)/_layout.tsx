/**
 * Tab layout — iOS26 Liquid Glass tab bar
 * 
 * The ONLY place glass/blur belongs is navigation chrome:
 * tab bar + header. Content should be clean and solid.
 * The background gradient gives the blur something to refract.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon(props: { name: IoniconsName; color: string; size?: number }) {
  return <Ionicons size={props.size ?? 22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.tabIconDefault,
        // ── Liquid Glass Tab Bar ──
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        // ── Liquid Glass Header ──
        headerTransparent: true,
        headerBlurEffect: isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterial',
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          letterSpacing: -0.4,
          color: colors.foreground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="grid-outline" color={color} />,
          headerTitle: 'Chiyu Social',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-outline" color={color} />,
          headerTitle: 'Schedule',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: colors.brand,
              width: 42,
              height: 42,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 0 : 10,
              shadowColor: colors.brand,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}>
              <TabBarIcon name="add" color="#FFF" size={24} />
            </View>
          ),
          headerTitle: 'Create Post',
        }}
      />
      <Tabs.Screen
        name="channels"
        options={{
          title: 'Connections',
          tabBarIcon: ({ color }) => <TabBarIcon name="share-social-outline" color={color} />,
          headerTitle: 'Social',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
