// Patient bottom tabs — Home, Exercícios da Memória, Configurações
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth';
import { colors, fonts, radii } from '../../lib/theme';

export default function PatientLayout() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bg,
        },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            testID="header-logout-button"
          >
            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
        headerTitle: '',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopColor: colors.borderSoft,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Platform.OS === 'ios' ? 10 : 12,
          borderRadius: radii.xl,
          borderColor: colors.borderSoft,
          borderWidth: 1,
          shadowColor: '#6A23D9',
          shadowOpacity: 0.18,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.bold, marginTop: 2 },
        tabBarIconStyle: { marginTop: 2 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Memória',
          tabBarIcon: ({ color, focused }) => <TabIcon name="bulb" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => <TabIcon name="settings" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  if (focused) {
    return (
      <View style={styles.activeWrap}>
        <LinearGradient colors={['#6A23D9', '#FF2D7A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Ionicons name={name} size={20} color="#fff" />
      </View>
    );
  }
  return <Ionicons name={name} size={22} color={color} />;
}

const styles = StyleSheet.create({
  activeWrap: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoutButton: {
    marginRight: 16,
    padding: 8,
  },
});
