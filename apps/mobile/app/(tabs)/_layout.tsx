/**
 * Tab layout — bottom navigation with iOS26 Liquid Glass aesthetic
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon(props: { name: IoniconsName; color: string; size?: number }) {
  return <Ionicons size={props.size ?? 22} style={{ marginBottom: -2 }} {...props} />;
}

function GlassTabBar() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(20, 20, 28, 0.88)', 'rgba(10, 10, 15, 0.95)']
            : ['rgba(255, 255, 255, 0.82)', 'rgba(248, 249, 253, 0.95)']
        }
        style={StyleSheet.absoluteFill}
      />
      {/* Top highlight line */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          height: 0.5,
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        }}
      />
    </View>
  );
}

function GlassHeader() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(10, 10, 15, 0.9)', 'rgba(10, 10, 15, 0.75)']
            : ['rgba(255, 255, 255, 0.92)', 'rgba(248, 249, 253, 0.8)']
        }
        style={StyleSheet.absoluteFill}
      />
      {/* Bottom separator */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }}
      />
    </View>
  );
}

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
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => <GlassTabBar />,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        headerTransparent: true,
        headerBackground: () => <GlassHeader />,
        headerTitleStyle: {
          fontWeight: '700',
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
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 0 : 10,
              shadowColor: colors.brand,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}>
              <TabBarIcon name="add" color="#FFF" size={26} />
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
