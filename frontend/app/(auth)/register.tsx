// Register — AURA premium LIGHT (mesma linguagem visual do login)
// IMPORTANTE: ZERO animações envolvendo Inputs/Buttons no Android (keyboard fix)
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, Role } from '../../lib/auth';
import { apiError } from '../../lib/api';
import { colors, fonts, fontSizes, gradients, radii, shadows, spacing } from '../../lib/theme';
import { PressableScale, Triggers } from '../../lib/animations';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraInput } from '../../components/AuraInput';
import { AuraButton } from '../../components/AuraButton';
import { sounds } from '../../lib/sounds';

const HEART = require('../../assets/images/aura-heart.png');

const ROLES: {
  id: Role;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly string[];
}[] = [
  { id: 'patient', title: 'Paciente', subtitle: 'Sou cuidado', icon: 'heart', gradient: gradients.pinkOrange },
  { id: 'caregiver', title: 'Cuidador', subtitle: 'Cuido com amor', icon: 'medkit', gradient: gradients.aura },
  { id: 'responsible', title: 'Familiar', subtitle: 'Acompanho de perto', icon: 'shield-checkmark', gradient: gradients.primary },
];

export default function Register() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), role);
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
      <AuraBackground variant="light" />

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
            {/* Header */}
            <View style={styles.headerRow}>
              <Link href="/(auth)/login" asChild>
                <PressableScale haptic="light" style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
                </PressableScale>
              </Link>
              <View style={styles.brandRow}>
                <View style={styles.brandCircle}>
                  <Image source={HEART} style={styles.brandImg} resizeMode="contain" />
                </View>
                <Text style={styles.brandText}>
                  aur<Text style={{ color: colors.pink }}>a</Text>
                </Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            {/* Card formulário */}
            <View style={styles.card}>
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>Vamos começar a cuidar juntos</Text>

              <Text style={styles.sectionLabel}>Eu sou</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => {
                  const active = role === r.id;
                  const Wrapper: any = active ? LinearGradient : View;
                  const wrapperExtras: any = active
                    ? {
                        colors: r.gradient,
                        start: { x: 0, y: 0 },
                        end: { x: 1, y: 1 },
                      }
                    : {};
                  return (
                    <PressableScale
                      key={r.id}
                      testID={`register-role-${r.id}`}
                      haptic="light"
                      onPress={() => {
                        sounds.play('tap');
                        setRole(r.id);
                      }}
                      style={styles.roleSlot as any}
                    >
                      <Wrapper
                        {...wrapperExtras}
                        style={[styles.roleCard, active && styles.roleCardActive] as any}
                      >
                        <View style={styles.roleIconCircle(active)}>
                          <Ionicons
                            name={r.icon}
                            size={22}
                            color={active ? colors.textInverse : colors.primary}
                          />
                        </View>
                        <Text style={[styles.roleTitle, active && { color: colors.textInverse }]}>
                          {r.title}
                        </Text>
                        <Text
                          style={[styles.roleSub, active && { color: 'rgba(255,255,255,0.9)' }]}
                        >
                          {r.subtitle}
                        </Text>
                      </Wrapper>
                    </PressableScale>
                  );
                })}
              </View>

              <View style={styles.formGroup}>
                <AuraInput
                  testID="register-name-input"
                  label="Nome completo"
                  icon="person-outline"
                  placeholder="Como você se chama"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <AuraInput
                  testID="register-email-input"
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
                  testID="register-password-input"
                  label="Senha"
                  icon="lock-closed-outline"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <AuraButton
                testID="register-submit-button"
                title="Criar minha conta"
                onPress={submit}
                loading={loading}
                large
                fullWidth
                iconRight="sparkles"
                style={{ marginTop: spacing.sm }}
              />

              <Link href="/(auth)/login" asChild>
                <PressableScale haptic="none" scaleTo={1} style={styles.linkRow}>
                  <Text style={styles.linkText}>
                    Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
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

const styles: any = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  brandImg: { width: 28, height: 28 },
  brandText: {
    fontSize: 24,
    fontFamily: fonts.extrabold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },

  // CARD
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: spacing.lg,
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 8,
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
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleSlot: { flex: 1 },
  roleCard: {
    minHeight: 130,
    backgroundColor: colors.bgSoft,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  roleCardActive: { borderColor: 'transparent', ...shadows.sm },
  roleIconCircle: (active: boolean) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: active ? 'rgba(255,255,255,0.28)' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  roleTitle: { fontSize: fontSizes.sm, fontFamily: fonts.bold, color: colors.textPrimary },
  roleSub: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  formGroup: { marginTop: 0 },
  linkRow: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { color: colors.textSecondary, fontSize: fontSizes.base, fontFamily: fonts.medium },
  linkBold: { color: colors.pink, fontFamily: fonts.bold },
});
