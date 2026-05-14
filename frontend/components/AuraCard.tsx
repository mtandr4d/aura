// AuraCard — Glassmorphism card with optional gradient header glow
// Suporte completo a dark mode via theme context
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/theme-context';
import { radii, shadows, spacing } from '../lib/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  glass?: boolean;
  padded?: boolean;
}

export function AuraCard({ children, style, glow, glass, padded = true }: Props) {
  const { colors, isDark } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: glass ? colors.glass : colors.card, borderColor: colors.borderSoft },
        glass && styles.glass,
        padded && styles.padded,
        shadows.card,
        style,
      ]}
    >
      {glow && (
        <LinearGradient
          colors={
            isDark
              ? ['rgba(139,92,246,0.12)', 'rgba(236,72,153,0.08)', 'transparent']
              : ['rgba(91,33,182,0.08)', 'rgba(236,72,153,0.04)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

// Solid gradient hero card (for stats / featured info)
export function AuraGradientCard({
  children,
  colors: cols,
  style,
}: {
  children: React.ReactNode;
  colors: readonly string[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, shadows.lg, { overflow: 'hidden' }, style]}>
      <LinearGradient colors={cols as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill]} />
      <View style={styles.padded}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glass: {
    borderColor: 'rgba(255,255,255,0.3)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' as any } : {}),
  },
  padded: { padding: spacing.lg },
});
