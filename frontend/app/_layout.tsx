import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Platform } from 'react-native';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { AuthProvider, useAuth } from '../lib/auth';
import { ActivePatientProvider } from '../lib/active-patient';
import { configureNotifications } from '../lib/notifications';
import { colors } from '../lib/theme';
import { sounds } from '../lib/sounds';

function RouteGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0];
    // Let the splash screen (app/index.tsx) own the initial redirect
    if (!first || first === undefined) return;

    const inAuth = first === '(auth)';
    if (!user && !inAuth && first !== undefined) {
      router.replace('/(auth)/login');
      return;
    }
    if (user) {
      const target = `(${user.role})`;
      if (first !== target && first !== undefined) {
        if (user.role === 'patient') router.replace('/(patient)');
        else if (user.role === 'caregiver') router.replace('/(caregiver)');
        else router.replace('/(responsible)');
      }
    }
  }, [user, loading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(patient)" />
      <Stack.Screen name="(caregiver)" />
      <Stack.Screen name="(responsible)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [fontTimeout, setFontTimeout] = useState(false);

  useEffect(() => {
    // Failsafe: se as fontes não carregarem em 4s (rede lenta), renderize mesmo assim com fallback
    const t = setTimeout(() => setFontTimeout(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    sounds.init();
    if (Platform.OS !== 'web') {
      configureNotifications().catch(() => {});
    }
  }, []);

  // Não bloqueamos a UI esperando fontes (usa fallback do sistema se Manrope demorar).
  // Isso evita tela de loading prolongada em redes lentas.
  void fontsLoaded;
  void fontTimeout;
  void setFontTimeout;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <ActivePatientProvider>
          <RouteGuard />
        </ActivePatientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
