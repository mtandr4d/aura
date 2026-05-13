// Register — AURA premium signup with role selection
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, Role } from '../../lib/auth';
import { apiError } from '../../lib/api';
import { colors, fonts, fontSizes, gradients, radii, shadows, spacing } from '../../lib/theme';
import { PressableScale, SlideUpView, Triggers } from '../../lib/animations';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraInput } from '../../components/AuraInput';
import { AuraButton } from '../../components/AuraButton';
import { sounds } from '../../lib/sounds';

const ROLES: {
  id: Role;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly string[];
}[] = [
  { id: 'patient', title: 'Paciente', subtitle: 'Sou cuidado', icon: 'heart', gradient: gradients.pinkOrange },
  { id: 'caregiver', title: 'Cuidador', subtitle: 'Cuido com amor', icon: 'medkit', gradient: gradients.teal },
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
    <View style={{ flex: 1 }}>
      <AuraBackground variant="light" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <SlideUpView delay={50}>
              <View style={styles.headerRow}>
                <Link href="/(auth)/login" asChild>
                  <PressableScale haptic="light" style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                  </PressableScale>
                </Link>
                <Text style={styles.headerTitle}>Criar conta</Text>
                <View style={{ width: 44 }} />
              </View>
            </SlideUpView>

            <SlideUpView delay={100}>
              <Text style={styles.welcomeBig}>Bem-vindo à Aura</Text>
              <Text style={styles.welcomeSub}>Vamos começar a cuidar juntos</Text>
            </SlideUpView>

            <SlideUpView delay={180}>
              <Text style={styles.sectionLabel}>Eu sou</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => {
                  const active = role === r.id;
                  return (
                    <PressableScale
                      key={r.id}
                      testID={`register-role-${r.id}`}
                      haptic="light"
                      onPress={() => {
                        sounds.play('tap');
                        setRole(r.id);
                      }}
                      style={[styles.roleCard, active && styles.roleCardActive] as any}
                    >
                      {active ? (
                        <LinearGradient
                          colors={r.gradient as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
                        />
                      ) : null}
                      <View style={styles.roleIconCircle(active)}>
                        <Ionicons name={r.icon} size={22} color={active ? colors.textInverse : colors.primary} />
                      </View>
                      <Text style={[styles.roleTitle, active && { color: colors.textInverse }]}>{r.title}</Text>
                      <Text style={[styles.roleSub, active && { color: 'rgba(255,255,255,0.85)' }]}>{r.subtitle}</Text>
                    </PressableScale>
                  );
                })}
              </View>
            </SlideUpView>

            <SlideUpView delay={250}>
              <AuraInput
                testID="register-name-input"
                label="Nome completo"
                icon="person-outline"
                placeholder="Como você se chama"
                value={name}
                onChangeText={setName}
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
            </SlideUpView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles: any = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  headerTitle: { fontSize: fontSizes.xl, fontFamily: fonts.extrabold, color: colors.textPrimary, letterSpacing: -0.5 },
  welcomeBig: { fontSize: fontSizes.h2, fontFamily: fonts.extrabold, color: colors.textPrimary, letterSpacing: -1 },
  welcomeSub: { fontSize: fontSizes.base, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    ...shadows.sm,
  },
  roleCardActive: { borderColor: 'transparent' },
  roleIconCircle: (active: boolean) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#F3F1F8',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  roleTitle: { fontSize: fontSizes.sm, fontFamily: fonts.bold, color: colors.textPrimary },
  roleSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSecondary, textAlign: 'center' },
  linkRow: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { color: colors.textSecondary, fontSize: fontSizes.base, fontFamily: fonts.medium },
  linkBold: { color: colors.primary, fontFamily: fonts.bold },
});
