// Theme Context com Dark Mode global e persistência
// Light/dark switch baseado em AsyncStorage. Provê useTheme() hook em qualquer lugar.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as lightColors } from './theme';

export type ThemeMode = 'light' | 'dark';

// Paleta DARK PREMIUM Aura
export const darkColors = {
  ...lightColors,
  // Surfaces
  bg: '#1B1240',
  bgSoft: '#2B1B5C',
  bgWarm: '#1F1547',
  bgPatient: '#1B1240',
  card: '#241758',
  cardSoft: '#2B1B5C',
  glass: 'rgba(36, 23, 88, 0.78)',
  glassDark: 'rgba(0,0,0,0.55)',
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#C7B8FF',
  textMuted: '#7C6FA8',
  textInverse: '#1B1240',
  patientText: '#FFFFFF',
  // Borders
  border: 'rgba(155, 107, 255, 0.22)',
  borderSoft: 'rgba(155, 107, 255, 0.14)',
  shadow: 'rgba(0,0,0,0.35)',
  shadowStrong: 'rgba(0,0,0,0.55)',
};

type Ctx = {
  mode: ThemeMode;
  isDark: boolean;
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
  colors: typeof lightColors;
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
    };
  }
  return ctx;
}
