// Login — AURA premium LIGHT (matching reference image exactly)
// Fundo claro lilás + círculos pastéis + logo em círculo branco + wordmark "aura"
// IMPORTANTE: ZERO animações que envolvam Inputs/Buttons no Android (keyboard bug fix)
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
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { apiError } from '../../lib/api';
import { colors, fonts, fontSizes, spacing } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';
import { PressableScale, Triggers } from '../../lib/animations';
import { AuraInput } from '../../components/AuraInput';
import { AuraButton } from '../../components/AuraButton';
import { AuraBackground } from '../../components/AuraBackground';
import { ThemeToggle } from '../../components/ThemeToggle';
import { sounds } from '../../lib/sounds';

const HEART = require('../../assets/images/aura-heart.png');

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { isDark, colors: themeColors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(email.trim().toLowerCase(), password);
      Triggers.success();
      sounds.play('success');
      
      // Redirecionar para a home correspondente ao role
      if (user.role === 'patient') {
        router.replace('/(patient)');
      } else if (user.role === 'caregiver') {
        router.replace('/(caregiver)');
      } else {
        router.replace('/(responsible)');
      }
    } catch (e) {
      Triggers.error();
      sounds.play('error');
      Alert.alert('Erro', apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: themeColors.bg }]}>
      {/* Fundo claro/escuro premium com círculos abstratos (referência oficial) */}
      <AuraBackground variant={isDark ? 'dark' : 'light'} />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Toggle dark/light no topo direito */}
            <View style={styles.topBar}>
              <ThemeToggle />
            </View>

            {/* MARCA: círculo branco + logo coração + wordmark "aura" (a final magenta) + slogan */}
            <View style={styles.brand}>
              <View style={styles.logoCircle}>
                <Image
                  source={HEART}
                  style={styles.logoImg}
                  resizeMode="contain"
                  accessibilityLabel="Aura logo"
                />
              </View>

              <Text style={[styles.wordmark, { color: themeColors.textPrimary }]}>
                aur<Text style={styles.wordmarkAccent}>a</Text>
              </Text>

              <Text style={[styles.slogan, { color: themeColors.textSecondary }]}>
                Cuidar de quem você <Text style={styles.sloganAccent}>ama</Text>
                {'\n'}faz tudo valer mais.
              </Text>
            </View>

            {/* Card com formulário (branco no light, escuro premium no dark) */}
            <View style={[styles.card, isDark && styles.cardDark]}>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>Entrar</Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Continue cuidando com carinho
              </Text>

              <View style={styles.formGroup}>
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
                <PressableScale
                  testID="go-to-register-link"
                  haptic="none"
                  scaleTo={1}
                  style={styles.linkRow}
                >
                  <Text style={[styles.linkText, { color: themeColors.textSecondary }]}>
                    Ainda não tem conta?{' '}
                    <Text style={styles.linkBold}>Criar conta</Text>
                  </Text>
                </PressableScale>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },

  // BRAND (logo + nome + slogan)
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra com glow rosa/roxo suave
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  logoImg: {
    width: 100,
    height: 100,
  },
  wordmark: {
    fontSize: 64,
    fontFamily: fonts.extrabold,
    color: colors.textPrimary,
    letterSpacing: -3,
    marginTop: 18,
    lineHeight: 70,
  },
  wordmarkAccent: {
    color: colors.pink,
  },
  slogan: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 22,
  },
  sloganAccent: {
    color: colors.pink,
    fontFamily: fonts.bold,
  },

  // CARD FORMULÁRIO
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: spacing.lg,
    paddingTop: spacing.lg + 4,
    // Sombra suave roxa
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: 'rgba(36, 23, 88, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(155, 107, 255, 0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.40,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.extrabold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formGroup: {
    marginTop: spacing.lg,
  },
  linkRow: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
  },
  linkBold: {
    color: colors.pink,
    fontFamily: fonts.bold,
  },
});
