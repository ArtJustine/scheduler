/**
 * Tab layout — bottom navigation with Chiyu-branded icons
 * Tabs: Dashboard, Schedule, Channels, Settings
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon(props: { name: IoniconsName; color: string; size?: number }) {
  return <Ionicons size={props.size ?? 24} style={{ marginBottom: -2 }} {...props} />;
}

import { BlurView } from 'expo-blur';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerTransparent: true,
        headerBackground: () => (
          <BlurView
            intensity={60}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
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
          title: 'Events',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-outline" color={color} />,
          headerTitle: 'Schedule',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: colors.brand,
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 0 : 10,
              shadowColor: colors.brand,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <TabBarIcon name="add" color="#FFF" size={30} />
            </View>
          ),
          headerTitle: 'Create Post',
        }}
      />
      <Tabs.Screen
        name="channels"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <TabBarIcon name="share-social-outline" color={color} />,
          headerTitle: 'Profiles',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          headerTitle: 'Account',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Keep this for any local styles if needed or remove if unused
});

