// Settings — Aura preferences (sounds, notifications, account)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme-context';
import { fonts, fontSizes, radii, shadows, spacing } from '../../lib/theme';
import { PressableScale, SlideUpView } from '../../lib/animations';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraCard } from '../../components/AuraCard';
import { AuraButton } from '../../components/AuraButton';
import { sounds } from '../../lib/sounds';

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { isDark, toggleMode, colors, gradients } = useTheme();
  const [soundsOn, setSoundsOn] = useState(true);

  useEffect(() => {
    (async () => {
      await sounds.init();
      setSoundsOn(sounds.isEnabled());
    })();
  }, []);

  const toggle = async (v: boolean) => {
    setSoundsOn(v);
    await sounds.setEnabled(v);
    if (v) sounds.play('success');
  };

  const confirmLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <AuraBackground variant="light" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SlideUpView delay={40}>
            <Text style={styles.title}>Ajustes</Text>
            <Text style={styles.subtitle}>Personalize sua experiência</Text>
          </SlideUpView>

          <SlideUpView delay={120}>
            <AuraCard glow style={{ marginTop: spacing.md }}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <LinearGradient colors={gradients.aura} style={StyleSheet.absoluteFill} />
                  <Text style={styles.avatarText}>
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{user?.full_name}</Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {user?.role === 'patient' ? 'Paciente' : user?.role === 'caregiver' ? 'Cuidador' : 'Familiar'}
                    </Text>
                  </View>
                </View>
              </View>
            </AuraCard>
          </SlideUpView>

          <SlideUpView delay={200}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferências</Text>
            <AuraCard>
              <SettingRow
                icon="moon"
                iconBg={isDark ? '#3D1F6E' : '#EDE9FE'}
                iconColor={colors.primary}
                title="Modo escuro"
                subtitle="Tema dark premium"
              >
                <Switch
                  testID="dark-mode-toggle"
                  value={isDark}
                  onValueChange={toggleMode}
                  trackColor={{ false: '#E2E8F0', true: colors.primaryLight }}
                  thumbColor={Platform.OS === 'android' ? (isDark ? colors.primary : '#fff') : undefined}
                  ios_backgroundColor="#E2E8F0"
                />
              </SettingRow>
              <Divider />
              <SettingRow
                icon="volume-high"
                iconBg={isDark ? '#7C2D54' : '#FCE7F3'}
                iconColor={colors.pink}
                title="Sons do app"
                subtitle="Toques suaves ao interagir"
              >
                <Switch
                  testID="sound-toggle"
                  value={soundsOn}
                  onValueChange={toggle}
                  trackColor={{ false: '#E2E8F0', true: colors.primaryLight }}
                  thumbColor={Platform.OS === 'android' ? (soundsOn ? colors.primary : '#fff') : undefined}
                  ios_backgroundColor="#E2E8F0"
                />
              </SettingRow>
              <Divider />
              <SettingRow
                icon="notifications"
                iconBg={isDark ? '#92400E' : '#FFEDD5'}
                iconColor={colors.warm}
                title="Notificações"
                subtitle="Lembretes de remédios e visitas"
              >
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </SettingRow>
              <Divider />
              <SettingRow
                icon="accessibility"
                iconBg={isDark ? '#065F46' : '#DCFCE7'}
                iconColor={colors.success}
                title="Acessibilidade"
                subtitle="Textos grandes e contraste"
              >
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </SettingRow>
            </AuraCard>
          </SlideUpView>

          <SlideUpView delay={280}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <AuraCard>
              <SettingRow icon="information-circle" iconBg="#EDE9FE" iconColor={colors.primary} title="Versão" subtitle="Aura 2.0.0" />
              <Divider />
              <SettingRow icon="heart" iconBg="#FCE7F3" iconColor={colors.pink} title="Sobre a Aura" subtitle="Cuidar de quem você ama faz tudo valer mais." />
            </AuraCard>
          </SlideUpView>

          <SlideUpView delay={360}>
            <AuraButton
              testID="logout-button"
              title="Sair da conta"
              variant="ghost"
              icon="log-out-outline"
              onPress={confirmLogout}
              style={{ marginTop: spacing.lg }}
              sound="tap"
            />
          </SlideUpView>

          <Text style={[styles.footer, { color: colors.textMuted }]}>Feito com 💜 pela equipe Aura</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {children}
    </View>
  );
}

const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  title: { fontSize: fontSizes.h2, fontFamily: fonts.extrabold, letterSpacing: -1 },
  subtitle: { fontSize: fontSizes.base, fontFamily: fonts.medium, marginTop: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.sm,
  },
  avatarText: { color: '#fff', fontFamily: fonts.extrabold, fontSize: 28 },
  profileName: { fontSize: fontSizes.lg, fontFamily: fonts.extrabold, letterSpacing: -0.3 },
  profileEmail: { fontSize: fontSizes.sm, fontFamily: fonts.medium, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginTop: 6,
  },
  roleBadgeText: { color: '#6A23D9', fontFamily: fonts.bold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: fontSizes.base, fontFamily: fonts.bold },
  rowSubtitle: { fontSize: fontSizes.sm, fontFamily: fonts.medium, marginTop: 2 },
  divider: { height: 1, marginVertical: 2 },
  footer: {
    textAlign: 'center',
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    marginTop: spacing.xl,
    letterSpacing: 0.6,
  },
});
