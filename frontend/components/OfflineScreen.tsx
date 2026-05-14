// Tela "Sem Internet" estilizada — referência oficial Aura
import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, fonts, fontSizes, spacing } from '../lib/theme';
import { AuraButton } from './AuraButton';
import { AuraBackground } from './AuraBackground';
import { PressableScale } from '../lib/animations';

interface Props {
  onRetry?: () => void;
  onContinueOffline?: () => void;
  message?: string;
}

export function OfflineScreen({ onRetry, onContinueOffline, message }: Props) {
  return (
    <View style={styles.root}>
      <AuraBackground variant="light" />
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.illuWrap}>
          {/* Cards quebrados estilo iOS — 3 cards inclinados com X de wifi */}
          <View style={[styles.card, styles.cardA]}>
            <Ionicons name="wifi" size={26} color={colors.primary} />
          </View>
          <View style={[styles.card, styles.cardB]}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.pink} />
          </View>
          <View style={[styles.card, styles.cardC]}>
            <Text style={styles.x}>×</Text>
          </View>
          <View style={styles.glow} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(500)} style={{ alignItems: 'center' }}>
          <Text style={styles.title}>
            Parece que você está{'\n'}sem <Text style={styles.titleAccent}>conexão</Text>
          </Text>
          <Text style={styles.desc}>
            {message ||
              'Não se preocupe! Algumas funções podem estar indisponíveis no momento. Tente novamente quando voltar.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(350).duration(500)} style={styles.actions}>
          <AuraButton
            title="Tentar novamente"
            onPress={onRetry}
            iconRight="refresh"
            large
            fullWidth
          />
          {onContinueOffline && (
            <PressableScale haptic="light" onPress={onContinueOffline} style={styles.ghostBtn}>
              <Text style={styles.ghostText}>Continuar offline</Text>
            </PressableScale>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  illuWrap: { width: 200, height: 200, marginBottom: spacing.xl },
  card: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  cardA: { top: 20, left: 30, transform: [{ rotate: '-12deg' }] },
  cardB: { top: 50, right: 20, transform: [{ rotate: '14deg' }] },
  cardC: { bottom: 30, left: 64, transform: [{ rotate: '-6deg' }] },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FF2D7A',
    opacity: 0.18,
    top: -20,
    left: -20,
    zIndex: -1,
    ...(Platform.OS === 'web' ? ({ filter: 'blur(40px)' as any } as any) : {}),
  },
  x: { fontSize: 36, color: colors.pink, fontFamily: fonts.extrabold, lineHeight: 36 },

  title: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 34,
  },
  titleAccent: { color: colors.pink },
  desc: {
    marginTop: 14,
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },

  actions: { marginTop: spacing.xl, width: '100%', maxWidth: 340, gap: spacing.sm, alignItems: 'center' },
  ghostBtn: { paddingVertical: 12 },
  ghostText: { fontFamily: fonts.bold, color: colors.textSecondary, fontSize: fontSizes.base },
});
