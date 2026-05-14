// Splash AURA — Light premium, matching referência (logo em círculo branco + wordmark)
// Animações leves: fade-in + glow pulse (apenas decorativos, não afetam UX)
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { AuraBackground } from '../components/AuraBackground';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';
import { hasSeenOnboarding } from '../lib/onboarding';
import { colors, fonts, fontSizes } from '../lib/theme';
import { sounds } from '../lib/sounds';

const LOGO = require('../assets/images/aura-heart.png');

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isDark, colors: themeColors } = useTheme();
  const glow = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Glow pulsante suave atrás do logo
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    // Logo aparece com leve scale-up
    scale.value = withDelay(
      100,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
    sounds.init();
  }, [glow, scale]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      if (!user) {
        const seen = await hasSeenOnboarding();
        router.replace(seen ? '/(auth)/login' : '/(auth)/onboarding');
      } else if (user.role === 'patient') router.replace('/(patient)');
      else if (user.role === 'caregiver') router.replace('/(caregiver)');
      else router.replace('/(responsible)');
    }, 2000);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.4,
    transform: [{ scale: 1 + glow.value * 0.12 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <View style={[styles.root, { backgroundColor: themeColors.bg }]}>
      <AuraBackground variant={isDark ? 'dark' : 'hero'} />

      <View style={styles.center} pointerEvents="none">
        {/* Halo pulsante atrás do logo */}
        <Animated.View style={[styles.halo, haloStyle]} />

        {/* Círculo branco com logo */}
        <Animated.View style={[styles.logoCircle, logoStyle]}>
          <Image source={LOGO} style={styles.logo} accessibilityLabel="Aura logo" />
        </Animated.View>

        {/* Wordmark com fade-in */}
        <Animated.View entering={FadeIn.delay(700).duration(700)}>
          <Text style={[styles.wordmark, { color: themeColors.textPrimary }]}>
            aur<Text style={styles.wordmarkAccent}>a</Text>
          </Text>
        </Animated.View>

        {/* Slogan com fade-in */}
        <Animated.View entering={FadeIn.delay(1100).duration(700)}>
          <Text style={[styles.slogan, { color: themeColors.textSecondary }]}>
            Cuidar de quem você <Text style={styles.sloganAccent}>ama</Text>
            {'\n'}faz tudo valer mais.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  halo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FF2D7A',
    ...(Platform.OS === 'web'
      ? { filter: 'blur(80px)' as any, opacity: 0.4 }
      : { opacity: 0.3 }),
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  logo: { width: 140, height: 140, resizeMode: 'contain' },
  wordmark: {
    fontSize: 72,
    fontFamily: fonts.extrabold,
    color: colors.textPrimary,
    letterSpacing: -3,
    marginTop: 28,
    lineHeight: 78,
  },
  wordmarkAccent: { color: colors.pink },
  slogan: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 340,
    lineHeight: 22,
  },
  sloganAccent: {
    color: colors.pink,
    fontFamily: fonts.bold,
  },
});
