// AuraBackground — Premium animated gradient + soft orbs (glassy backdrop)
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../lib/theme';

interface Props {
  variant?: 'light' | 'hero' | 'patient' | 'dark';
  children?: React.ReactNode;
}

export function AuraBackground({ variant = 'light', children }: Props) {
  const cfg = CONFIGS[variant];
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={cfg.bg as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft floating orbs for depth */}
      <View
        pointerEvents="none"
        style={[styles.orb, { top: -60, right: -40, backgroundColor: cfg.orb1, opacity: cfg.opacity }]}
      />
      <View
        pointerEvents="none"
        style={[styles.orb2, { bottom: -80, left: -60, backgroundColor: cfg.orb2, opacity: cfg.opacity }]}
      />
      <View
        pointerEvents="none"
        style={[styles.orb3, { top: '40%', left: '60%', backgroundColor: cfg.orb3, opacity: cfg.opacity * 0.7 }]}
      />
      {children}
    </View>
  );
}

const CONFIGS = {
  light: {
    bg: ['#FAFAFC', '#F3F1F8', '#FFF5F8'] as const,
    orb1: colors.primaryLight,
    orb2: colors.pink,
    orb3: colors.warm,
    opacity: 0.16,
  },
  hero: {
    bg: ['#5B21B6', '#7C3AED', '#EC4899'] as const,
    orb1: colors.warm,
    orb2: colors.teal,
    orb3: colors.pink,
    opacity: 0.3,
  },
  patient: {
    bg: ['#FFFBF6', '#FFF1E5', '#FCE7F3'] as const,
    orb1: colors.warm,
    orb2: colors.pink,
    orb3: colors.primaryLight,
    opacity: 0.22,
  },
  dark: {
    bg: ['#0F172A', '#1E1B4B', '#312E81'] as const,
    orb1: colors.primary,
    orb2: colors.pink,
    orb3: colors.warm,
    opacity: 0.35,
  },
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  orb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    ...(Platform.OS !== 'web' ? { } : { filter: 'blur(60px)' as any }),
  },
  orb2: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    ...(Platform.OS !== 'web' ? { } : { filter: 'blur(80px)' as any }),
  },
  orb3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    ...(Platform.OS !== 'web' ? { } : { filter: 'blur(60px)' as any }),
  },
});
