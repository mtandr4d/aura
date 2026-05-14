// AuraBackground — Fundo CLARO premium com círculos pastéis abstratos
// Inspirado nas referências oficiais do Aura: lilás suave + círculos rosa/pêssego/roxo
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  variant?: 'light' | 'hero' | 'patient' | 'dark';
  children?: React.ReactNode;
}

export function AuraBackground({ variant = 'light', children }: Props) {
  const cfg = CONFIGS[variant];
  return (
    <View style={styles.root} pointerEvents="box-none">
      <LinearGradient
        colors={cfg.bg as any}
        start={cfg.start}
        end={cfg.end}
        style={StyleSheet.absoluteFill}
      />
      {/* Círculos abstratos espalhados — REFERÊNCIA OFICIAL */}
      {cfg.circles.map((c, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.circle,
            {
              width: c.size,
              height: c.size,
              borderRadius: c.size / 2,
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
              backgroundColor: c.color,
              opacity: c.opacity,
              ...(Platform.OS === 'web' ? { filter: `blur(${c.blur}px)` as any } : {}),
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
}

type Circle = {
  size: number;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  color: string;
  opacity: number;
  blur: number;
};

const CONFIGS: Record<
  string,
  {
    bg: readonly string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
    circles: Circle[];
  }
> = {
  // Tela clara premium (Login, Register, Splash) — IDÊNTICO às referências
  light: {
    bg: ['#F6F3FF', '#FFF7FA', '#F1EEFF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    circles: [
      // Canto superior esquerdo - lilás
      { size: 200, top: -60, left: -50, color: '#E1D6FF', opacity: 0.65, blur: 40 },
      // Canto superior direito - rosa suave
      { size: 160, top: 40, right: -40, color: '#FFD6E5', opacity: 0.55, blur: 35 },
      // Meio direito - pêssego
      { size: 220, top: '38%', right: -90, color: '#FFE4C7', opacity: 0.50, blur: 50 },
      // Meio esquerdo - lilás médio
      { size: 180, top: '50%', left: -70, color: '#D8C5FF', opacity: 0.45, blur: 45 },
      // Inferior esquerdo - rosa
      { size: 240, bottom: -80, left: -60, color: '#FFC9D9', opacity: 0.45, blur: 55 },
      // Inferior direito - lilás escuro
      { size: 200, bottom: 60, right: -70, color: '#C8B6F5', opacity: 0.40, blur: 50 },
    ],
  },
  // Splash / Hero — gradient mais saturado em motion
  hero: {
    bg: ['#F1EEFF', '#FFE4E4', '#FFEFD6'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    circles: [
      { size: 280, top: -80, left: -60, color: '#C8B6F5', opacity: 0.55, blur: 60 },
      { size: 240, top: 80, right: -70, color: '#FFB8D0', opacity: 0.50, blur: 55 },
      { size: 200, bottom: 100, left: '20%', color: '#FFCBA0', opacity: 0.45, blur: 50 },
      { size: 220, bottom: -60, right: -50, color: '#D8C5FF', opacity: 0.50, blur: 55 },
    ],
  },
  patient: {
    bg: ['#FFF7FA', '#FFEFE4', '#F6F3FF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    circles: [
      { size: 220, top: -60, right: -60, color: '#FFD6E5', opacity: 0.50, blur: 50 },
      { size: 180, top: '45%', left: -50, color: '#E1D6FF', opacity: 0.45, blur: 45 },
      { size: 240, bottom: -80, right: -40, color: '#FFE4C7', opacity: 0.45, blur: 55 },
    ],
  },
  // Dark mode premium (mantém p/ tela escura caso usemos)
  dark: {
    bg: ['#1B1240', '#2B1B5C', '#3D1F6E'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    circles: [
      { size: 280, top: -80, right: -60, color: '#6A23D9', opacity: 0.35, blur: 70 },
      { size: 240, bottom: 100, left: -60, color: '#FF2D7A', opacity: 0.28, blur: 60 },
      { size: 200, top: '40%', left: '50%', color: '#FF8A00', opacity: 0.20, blur: 50 },
    ],
  },
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  circle: {
    position: 'absolute',
  },
});
