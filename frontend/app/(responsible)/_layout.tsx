import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii } from '../../lib/theme';

export default function ResponsibleLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopWidth: 1,
          borderTopColor: colors.borderSoft,
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Platform.OS === 'ios' ? 10 : 12,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          shadowColor: '#5B21B6',
          shadowOpacity: 0.18,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.bold, marginTop: 2 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, focused }) => <TabIcon name="map" color={color} focused={focused} /> }} />
      <Tabs.Screen name="shopping" options={{ title: 'Compras', tabBarIcon: ({ color, focused }) => <TabIcon name="cart" color={color} focused={focused} /> }} />
      <Tabs.Screen name="visits" options={{ title: 'Visitas', tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Conversa', tabBarIcon: ({ color, focused }) => <TabIcon name="chatbubbles" color={color} focused={focused} /> }} />
    </Tabs>
  );
}

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  if (focused) {
    return (
      <View style={styles.activeWrap}>
        <LinearGradient colors={['#5B21B6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Ionicons name={name} size={20} color="#fff" />
      </View>
    );
  }
  return <Ionicons name={name} size={22} color={color} />;
}

const styles = StyleSheet.create({
  activeWrap: { width: 42, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
