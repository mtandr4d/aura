// Login — AURA premium auth screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { apiError } from '../../lib/api';
import { colors, fonts, fontSizes, spacing, SLOGAN } from '../../lib/theme';
import { PressableScale, SlideUpView, Triggers } from '../../lib/animations';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraLogo, AuraSlogan } from '../../components/AuraLogo';
import { AuraInput } from '../../components/AuraInput';
import { AuraButton } from '../../components/AuraButton';
import { AuraCard } from '../../components/AuraCard';
import { sounds } from '../../lib/sounds';

export default function Login() {
  const { signIn } = useAuth();
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
    <View style={{ flex: 1 }}>
      <AuraBackground variant="light" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <SlideUpView delay={50}>
              <View style={styles.brand}>
                <AuraLogo size={110} showWordmark />
                <AuraSlogan size={15} />
              </View>
            </SlideUpView>

            <SlideUpView delay={200}>
              <AuraCard glow style={styles.card}>
                <Text style={styles.title}>Bem-vindo de volta</Text>
                <Text style={styles.subtitle}>Entre para continuar cuidando com carinho</Text>

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
              </AuraCard>
            </SlideUpView>

            <SlideUpView delay={500}>
              <Text style={styles.footer}>Aura • Cuidado que se sente</Text>
            </SlideUpView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: spacing.lg },
  brandTitle: {
    fontSize: 48,
    fontFamily: fonts.extrabold,
    color: colors.navy,
    letterSpacing: -2,
    marginTop: 14,
  },
  brandSub: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: { padding: spacing.lg },
  title: { fontSize: fontSizes.h3, fontFamily: fonts.extrabold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSizes.base, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 4 },
  linkRow: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { color: colors.textSecondary, fontSize: fontSizes.base, fontFamily: fonts.medium },
  linkBold: { color: colors.primary, fontFamily: fonts.bold },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    marginTop: spacing.xl,
    letterSpacing: 0.8,
  },
});
