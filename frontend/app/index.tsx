// Splash AURA — Animação PREMIUM como referência
// Sequência: ponto → expansão → ícone completo → wordmark
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AuraBackground } from '../components/AuraBackground';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';
import { hasSeenOnboarding } from '../lib/onboarding';
import { fonts, fontSizes } from '../lib/theme';
import { sounds } from '../lib/sounds';

const HEART_ICON = require('../assets/images/aura-heart.png');

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isDark, colors } = useTheme();
  
  // Animações em sequência
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);

  useEffect(() => {
    sounds.init();
    
    // 1. Ponto inicial + glow (0-400ms)
    glowScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    glowOpacity.value = withTiming(0.6, { duration: 400 });
    
    // 2. Círculo branco expande (400-1000ms)
    circleScale.value = withDelay(
      400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    
    // 3. Ícone do coração aparece (1000-1600ms)
    iconScale.value = withDelay(
      1000,
      withSequence(
        withTiming(1.15, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
      )
    );
    iconOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 400 })
    );
    
    // 4. Wordmark "aura" (1600-2200ms)
    textOpacity.value = withDelay(
      1600,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );
    
    // 5. Slogan (2200ms)
    sloganOpacity.value = withDelay(
      2200,
      withTiming(1, { duration: 600 })
    );
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      if (!user) {
        const seen = await hasSeenOnboarding();
        router.replace(seen ? '/(auth)/login' : '/(auth)/onboarding');
      } else if (user.role === 'patient') router.replace('/(patient)');
      else if (user.role === 'caregiver') router.replace('/(caregiver)');
      else router.replace('/(responsible)');
    }, 2800);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AuraBackground variant={isDark ? 'dark' : 'hero'} />

      <View style={styles.center} pointerEvents="none">
        {/* Glow effect atrás */}
        <Animated.View style={[styles.glowWrap, glowStyle]}>
          <LinearGradient
            colors={['#FF2D7A', '#8B5CF6', '#FF8A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glow}
          />
        </Animated.View>

        {/* Círculo branco com coração */}
        <Animated.View style={[styles.circleWrap, circleStyle]}>
          <View style={styles.circle}>
            <Animated.View style={iconStyle}>
              <Image 
                source={HEART_ICON} 
                style={styles.heart}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Wordmark "aura" */}
        <Animated.View style={[styles.textWrap, textStyle]}>
          <Text style={[styles.wordmark, { color: colors.textPrimary }]}>
            aur<Text style={[styles.wordmarkAccent, { color: colors.pink }]}>a</Text>
          </Text>
        </Animated.View>

        {/* Slogan */}
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
  glowWrap: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  glow: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
    opacity: 0.3,
  },
  circleWrap: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  heart: {
    width: 100,
    height: 100,
  },
  textWrap: {
    marginTop: 8,
  },
  wordmark: {
    fontSize: 64,
    fontFamily: fonts.extrabold,
    letterSpacing: -2.5,
    lineHeight: 70,
  },
  wordmarkAccent: {
    fontFamily: fonts.extrabold,
  },
  slogan: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 340,
    lineHeight: 22,
  },
  sloganAccent: {
    fontFamily: fonts.bold,
  },
});
