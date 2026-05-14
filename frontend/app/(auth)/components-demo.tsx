// Tela de demonstração de componentes premium do Aura (offline + skeletons)
// Acessível via /(auth)/components-demo \u2014 útil para QA e demonstração
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraButton } from '../../components/AuraButton';
import { OfflineScreen } from '../../components/OfflineScreen';
import {
  SkeletonHomeScreen,
  SkeletonHeader,
  SkeletonList,
} from '../../components/AuraSkeleton';
import { ThemeToggle } from '../../components/ThemeToggle';
import { PressableScale } from '../../lib/animations';
import { useTheme } from '../../lib/theme-context';
import { colors, fonts, fontSizes, radii, spacing } from '../../lib/theme';

type Demo = 'menu' | 'offline' | 'skeleton-home' | 'skeleton-list';

export default function ComponentsDemo() {
  const [demo, setDemo] = useState<Demo>('menu');
  const router = useRouter();
  const { isDark, colors: themed } = useTheme();

  if (demo === 'offline') {
    return (
      <OfflineScreen
        onRetry={() => {
          Alert.alert('Conexão', 'Tentando novamente...');
          setDemo('menu');
        }}
        onContinueOffline={() => setDemo('menu')}
      />
    );
  }

  if (demo === 'skeleton-home') {
    return (
      <View style={{ flex: 1, backgroundColor: themed.bg }}>
        <AuraBackground variant={isDark ? 'dark' : 'light'} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.demoHeader}>
            <PressableScale haptic="light" onPress={() => setDemo('menu')} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={themed.textPrimary} />
            </PressableScale>
            <Text style={[styles.demoHeaderText, { color: themed.textPrimary }]}>Skeleton Home</Text>
            <View style={{ width: 44 }} />
          </View>
          <ScrollView>
            <SkeletonHomeScreen />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (demo === 'skeleton-list') {
    return (
      <View style={{ flex: 1, backgroundColor: themed.bg }}>
        <AuraBackground variant={isDark ? 'dark' : 'light'} />
        <SafeAreaView style={{ flex: 1, padding: spacing.lg }}>
          <View style={styles.demoHeader}>
            <PressableScale haptic="light" onPress={() => setDemo('menu')} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={themed.textPrimary} />
            </PressableScale>
            <Text style={[styles.demoHeaderText, { color: themed.textPrimary }]}>Skeleton List</Text>
            <View style={{ width: 44 }} />
          </View>
          <SkeletonHeader />
          <SkeletonList count={5} type="card" />
        </SafeAreaView>
      </View>
    );
  }

  // MENU
  return (
    <View style={{ flex: 1, backgroundColor: themed.bg }}>
      <AuraBackground variant={isDark ? 'dark' : 'light'} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.demoHeader}>
          <PressableScale haptic="light" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={themed.textPrimary} />
          </PressableScale>
          <Text style={[styles.demoHeaderText, { color: themed.textPrimary }]}>Aura Components</Text>
          <ThemeToggle size={40} />
        </View>

        <ScrollView contentContainerStyle={styles.menu}>
          <Text style={[styles.menuTitle, { color: themed.textPrimary }]}>
            Demonstração de{'\n'}componentes premium
          </Text>
          <Text style={[styles.menuSub, { color: themed.textSecondary }]}>
            Visualize cada componente Aura em ação
          </Text>

          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            <DemoCard
              icon="cloud-offline-outline"
              title="Tela Sem Internet"
              desc="Card animado com cards inclinados e CTAs"
              onPress={() => setDemo('offline')}
              isDark={isDark}
              themed={themed}
            />
            <DemoCard
              icon="apps-outline"
              title="Skeleton Home Screen"
              desc="Loading state da tela inicial"
              onPress={() => setDemo('skeleton-home')}
              isDark={isDark}
              themed={themed}
            />
            <DemoCard
              icon="list-outline"
              title="Skeleton List"
              desc="Loading de listas com cards"
              onPress={() => setDemo('skeleton-list')}
              isDark={isDark}
              themed={themed}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DemoCard({
  icon,
  title,
  desc,
  onPress,
  isDark,
  themed,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  onPress: () => void;
  isDark: boolean;
  themed: typeof colors;
}) {
  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      style={[
        styles.demoCard,
        {
          backgroundColor: isDark ? 'rgba(36,23,88,0.65)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(155,107,255,0.20)' : colors.borderSoft,
        },
      ]}
    >
      <View style={[styles.demoIc, { backgroundColor: isDark ? 'rgba(106,35,217,0.25)' : '#F1EEFF' }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.demoCardTitle, { color: themed.textPrimary }]}>{title}</Text>
        <Text style={[styles.demoCardDesc, { color: themed.textSecondary }]}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themed.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  demoHeaderText: { fontFamily: fonts.bold, fontSize: fontSizes.lg },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  menu: { padding: spacing.lg, paddingTop: spacing.md },
  menuTitle: { fontFamily: fonts.extrabold, fontSize: 32, letterSpacing: -1, lineHeight: 36 },
  menuSub: { fontFamily: fonts.medium, fontSize: fontSizes.base, marginTop: 6 },

  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  demoIc: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCardTitle: { fontFamily: fonts.bold, fontSize: fontSizes.base },
  demoCardDesc: { fontFamily: fonts.medium, fontSize: 13, marginTop: 2 },
});
