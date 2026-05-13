// Login — AURA premium com logo grande e fundo dark dramático
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useAuth } from '../../lib/auth';
import { apiError } from '../../lib/api';
import { colors, fonts, fontSizes, gradients, spacing } from '../../lib/theme';
import { PressableScale, Triggers } from '../../lib/animations';
import { AuraInput } from '../../components/AuraInput';
import { AuraButton } from '../../components/AuraButton';
import { sounds } from '../../lib/sounds';

const HEART = require('../../assets/images/aura-heart.png');

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.4,
    transform: [{ scale: 1 + glow.value * 0.15 }],
  }));

  const submit = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      Triggers.success();
      sounds.play('success');
    } catch (e) {
      Triggers.error();
      sounds.play('error');
      Alert.alert('Erro', apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Fundo dramático com gradiente AURA */}
      <LinearGradient
        colors={['#0A0F1F', '#1E1B4B', '#5B21B6', '#EC4899']}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Orbs flutuantes para dar profundidade */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb3]} pointerEvents="none" />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo GIGANTE conversando com o fundo */}
            <View style={styles.brand}>
              <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none" />
              <Image
                source={HEART}
                style={styles.heartLogo}
                resizeMode="contain"
                accessibilityLabel="Aura logo"
              />
              <Text style={styles.wordmark}>
                aur<Text style={styles.wordmarkAccent}>a</Text>
              </Text>
              <Text style={styles.slogan}>
                Cuidar de quem você <Text style={styles.sloganAccent}>ama</Text>{'\n'}faz tudo valer mais.
              </Text>
            </View>

            {/* Form em card glass */}
            <View style={styles.card}>
              <Text style={styles.title}>Entrar</Text>
              <Text style={styles.subtitle}>Continue cuidando com carinho</Text>

              <View style={{ marginTop: spacing.lg }}>
                <AuraInput
                  testID="login-email-input"
                  label="Email"
                  icon="mail-outline"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
                <AuraInput
                  testID="login-password-input"
                  label="Senha"
                  icon="lock-closed-outline"
                  placeholder="Sua senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  rightIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPwd(!showPwd)}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                />
              </View>

              <AuraButton
                testID="login-submit-button"
                title="Entrar"
                onPress={submit}
                loading={loading}
                large
                fullWidth
                iconRight="arrow-forward"
                style={{ marginTop: spacing.sm }}
              />

              <Link href="/(auth)/register" asChild>
                <PressableScale testID="go-to-register-link" haptic="none" scaleTo={1} style={styles.linkRow}>
                  <Text style={styles.linkText}>
                    Ainda não tem conta? <Text style={styles.linkBold}>Criar conta</Text>
                  </Text>
                </PressableScale>
              </Link>
            </View>

            <Text style={styles.footer}>Aura • Cuidado que se sente</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center', paddingTop: 30 },

  // Orbs decorativos
  orb: { position: 'absolute', borderRadius: 200 },
  orb1: { width: 320, height: 320, backgroundColor: colors.pink, top: -80, right: -80, opacity: 0.35 },
  orb2: { width: 280, height: 280, backgroundColor: colors.warm, bottom: 100, left: -100, opacity: 0.25 },
  orb3: { width: 220, height: 220, backgroundColor: colors.primary, top: '40%', left: '30%', opacity: 0.2 },

  // Brand
  brand: { alignItems: 'center', marginBottom: spacing.xl, position: 'relative' },
  halo: {
    position: 'absolute',
    top: -20,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.pink,
    ...(Platform.OS === 'web' ? { filter: 'blur(60px)' as any } : { opacity: 0.4 }),
  },
  heartLogo: {
    width: 200,
    height: 200,
    // sem fundo, transparente — conversa com o gradient do fundo
  },
  wordmark: {
    fontSize: 64,
    fontFamily: fonts.extrabold,
    color: colors.textInverse,
    letterSpacing: -2.5,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  wordmarkAccent: { color: colors.warm },
  slogan: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
    lineHeight: 22,
  },
  sloganAccent: { color: colors.pink, fontFamily: fonts.bold },

  // Card form
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 20,
  },
  title: { fontSize: fontSizes.h3, fontFamily: fonts.extrabold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSizes.base, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 4 },
  linkRow: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { color: colors.textSecondary, fontSize: fontSizes.base, fontFamily: fonts.medium },
  linkBold: { color: colors.primary, fontFamily: fonts.bold },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    marginTop: spacing.xl,
    letterSpacing: 1.2,
  },
});
