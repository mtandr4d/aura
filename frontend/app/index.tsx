// Splash AURA — PREMIUM MINIMALISTA (sem animação problemática)
// Logo estático com fade suave, fundo clean
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AuraBackground } from '../components/AuraBackground';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';
import { hasSeenOnboarding } from '../lib/onboarding';
import { fonts, fontSizes } from '../lib/theme';
import { sounds } from '../lib/sounds';

const LOGO = require('../assets/images/aura-logo.png');

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isDark, colors } = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    sounds.init();
    // Animação simples e suave
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [opacity, scale]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      if (!user) {
        const seen = await hasSeenOnboarding();
        router.replace(seen ? '/(auth)/login' : '/(auth)/onboarding');
      } else if (user.role === 'patient') router.replace('/(patient)');
      else if (user.role === 'caregiver') router.replace('/(caregiver)');
      else router.replace('/(responsible)');
    }, 1800);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AuraBackground variant={isDark ? 'dark' : 'hero'} />

      <View style={styles.center} pointerEvents="none">
        {/* Logo completo (coração + wordmark) */}
        <Animated.View style={logoStyle}>
          <Image 
            source={LOGO} 
            style={styles.logo} 
            resizeMode="contain"
            accessibilityLabel="Aura logo"
          />
        </Animated.View>

        {/* Slogan */}
        <Animated.View style={logoStyle}>
          <Text style={[styles.slogan, { color: colors.textSecondary }]}>
            Cuidar de quem você <Text style={[styles.sloganAccent, { color: colors.pink }]}>ama</Text>
            {'\n'}faz tudo valer mais.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 280,
    height: 280,
  },
  slogan: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 340,
    lineHeight: 22,
  },
  sloganAccent: {
    fontFamily: fonts.bold,
  },
});
