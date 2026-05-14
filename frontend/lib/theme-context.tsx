// Theme Context com Dark Mode global e persistência
// Light/dark switch baseado em AsyncStorage. Provê useTheme() hook em qualquer lugar.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as lightColors, gradients as lightGradients } from './theme';

export type ThemeMode = 'light' | 'dark';

// Paleta DARK PREMIUM Aura (conforme referência)
export const darkColors = {
  // Brand core (accent colors mantêm vibrantes)
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F59E0B',
  teal: '#10B981',
  navy: '#1B1240',

  // Semantic
  primary: '#8B5CF6',
  primaryDark: '#6A23D9',
  primaryLight: '#A78BFA',
  accent: '#EC4899',
  accentSoft: '#7C2D54',
  warm: '#F59E0B',
  warmSoft: '#92400E',
  success: '#10B981',
  successDark: '#059669',
  sos: '#EF4444',
  sosDark: '#DC2626',

  // Dark surfaces (fundo escuro premium)
  bg: '#0F0B1F',
  bgSoft: '#1B1240',
  bgWarm: '#1F1738',
  bgPatient: '#1B1240',
  card: '#2B1B5C',
  cardSoft: '#3D1F6E',
  glass: 'rgba(59,48,96,0.78)',
  glassDark: 'rgba(27,18,64,0.85)',

  // Text (branco e roxo claro)
  textPrimary: '#FFFFFF',
  textSecondary: '#C4B5FD',
  textMuted: '#8B7BA8',
  textInverse: '#1B1240',
  textInverseAlt: '#0F0B1F',
  patientText: '#FFFFFF',
  patientAlert: '#7C2D12',

  // Borders & shadows (roxo escuro)
  border: '#4C3883',
  borderSoft: '#3D1F6E',
  borderLight: '#3D1F6E',
  shadow: 'rgba(0,0,0,0.45)',
  shadowStrong: 'rgba(0,0,0,0.65)',

  // Legacy
  warning: '#F59E0B',
  secondary: '#10B981',
  secondaryDark: '#059669',
  tertiary: '#F59E0B',
};

type Ctx = {
  mode: ThemeMode;
  isDark: boolean;
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
  colors: typeof lightColors;
  gradients: typeof lightGradients;
};

const ThemeCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = '@aura:theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  // Hydrate from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'dark' || v === 'light') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };
  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  const value = useMemo<Ctx>(
    () => ({
      mode,
      isDark: mode === 'dark',
      toggleMode,
      setMode,
      colors: mode === 'dark' ? darkColors : lightColors,
      gradients: lightGradients,
    }),
    [mode],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    // Safe fallback se não estiver dentro do provider
    return {
      mode: 'light',
      isDark: false,
      toggleMode: () => {},
      setMode: () => {},
      colors: lightColors,
      gradients: lightGradients,
    };
  }
  return ctx;
}
