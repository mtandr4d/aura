// Splash/Index — AURA entry com logo oficial + halo gradiente
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AuraBackground } from '../components/AuraBackground';
import { useAuth } from '../lib/auth';
import { colors, fonts, fontSizes } from '../lib/theme';
import { sounds } from '../lib/sounds';

const LOGO = require('../assets/images/aura-logo.jpg');

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    sounds.init();
  }, [glow]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (!user) router.replace('/(auth)/login');
      else if (user.role === 'patient') router.replace('/(patient)');
      else if (user.role === 'caregiver') router.replace('/(caregiver)');
      else router.replace('/(responsible)');
    }, 1800);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.45,
    transform: [{ scale: 1 + glow.value * 0.15 }],
  }));

  return (
    <View style={styles.root}>
      <AuraBackground variant="hero" />
      <View style={styles.center}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <Animated.View entering={FadeIn.duration(700)} style={styles.logoCircle}>
          <Image source={LOGO} style={styles.logo} accessibilityLabel="Aura logo" />
        </Animated.View>
        <Animated.Text entering={FadeInUp.delay(400).duration(600)} style={styles.slogan}>
          Cuidar de quem você <Text style={styles.sloganAccent}>ama</Text> faz tudo valer mais.
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  halo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.pink,
    ...(Platform.OS === 'web' ? { filter: 'blur(70px)' as any } : { opacity: 0.45 }),
  },
  logoCircle: {
    width: 200,
    height: 200,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
  logo: { width: 180, height: 180, resizeMode: 'contain' },
  slogan: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 28,
    maxWidth: 340,
    lineHeight: 24,
  },
  sloganAccent: {
    color: colors.pink,
    fontFamily: fonts.bold,
  },
});
