// Splash AURA — Animação premium do coração se formando (conforme referência)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { HeartAnimation } from '../components/HeartAnimation';
import { AuraBackground } from '../components/AuraBackground';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';
import { hasSeenOnboarding } from '../lib/onboarding';
import { fonts, fontSizes } from '../lib/theme';
import { sounds } from '../lib/sounds';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isDark, colors } = useTheme();
  const [heartComplete, setHeartComplete] = useState(false);
  const logoScale = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);

  useEffect(() => {
    sounds.init();
  }, []);

  // Após coração completar, anima wordmark e slogan
  useEffect(() => {
    if (heartComplete) {
      logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      sloganOpacity.value = withDelay(400, withTiming(1, { duration: 700 }));
    }
  }, [heartComplete, logoScale, sloganOpacity]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      if (!user) {
        const seen = await hasSeenOnboarding();
        router.replace(seen ? '/(auth)/login' : '/(auth)/onboarding');
      } else if (user.role === 'patient') router.replace('/(patient)');
      else if (user.role === 'caregiver') router.replace('/(caregiver)');
      else router.replace('/(responsible)');
    }, 2600);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoScale.value,
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AuraBackground variant={isDark ? 'dark' : 'hero'} />

      <View style={styles.center} pointerEvents="none">
        {/* Animação do coração se formando */}
        <HeartAnimation size={160} onComplete={() => setHeartComplete(true)} />

        {/* Wordmark "aura" com fade-in após coração */}
        <Animated.View style={[logoStyle, { marginTop: 32 }]}>
          <Text style={[styles.wordmark, { color: colors.textPrimary }]}>
            aur<Text style={[styles.wordmarkAccent, { color: colors.pink }]}>a</Text>
          </Text>
        </Animated.View>

        {/* Slogan com fade-in */}
        <Animated.View style={sloganStyle}>
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
  wordmark: {
    fontSize: 72,
    fontFamily: fonts.extrabold,
    letterSpacing: -3,
    lineHeight: 78,
  },
  wordmarkAccent: {
    fontFamily: fonts.extrabold,
  },
  slogan: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 340,
    lineHeight: 22,
  },
  sloganAccent: {
    fontFamily: fonts.bold,
  },
});
