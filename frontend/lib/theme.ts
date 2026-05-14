// =============================================================
// AURA Design Tokens — Premium Light iOS / Glassmorphism
// Brand palette (referência oficial): Roxo · Rosa magenta · Laranja
// "Cuidar de quem você ama faz tudo valer mais."
// =============================================================
export const colors = {
  // Brand core (paleta oficial das referências)
  purple: '#6A23D9',
  pink: '#FF2D7A',
  orange: '#FF8A00',
  teal: '#00B894',
  navy: '#1B1240',

  // Semantic aliases
  primary: '#6A23D9',
  primaryDark: '#4F19A8',
  primaryLight: '#9B6BFF',
  accent: '#FF2D7A',
  accentSoft: '#FFD6E5',
  warm: '#FF8A00',
  warmSoft: '#FFE4C7',
  success: '#00B894',
  successDark: '#059669',
  sos: '#FF3B30',
  sosDark: '#C92A1F',

  // Surfaces — fundo CLARO premium (lilás + pêssego + branco)
  bg: '#F6F3FF',
  bgSoft: '#F1EEFF',
  bgWarm: '#FFF7FA',
  bgPatient: '#FFF7FA',
  card: '#FFFFFF',
  cardSoft: '#FBFAFF',
  glass: 'rgba(255,255,255,0.78)',
  glassDark: 'rgba(27,18,64,0.55)',

  // Text
  textPrimary: '#1B1240',
  textSecondary: '#5B4D7A',
  textMuted: '#9B91B2',
  textInverse: '#FFFFFF',
  patientText: '#1B1240',

  // Borders & shadows (sombra com tom roxo bem suave)
  border: '#E9E3F5',
  borderSoft: '#EFEAF8',
  shadow: 'rgba(106, 35, 217, 0.10)',
  shadowStrong: 'rgba(27, 18, 64, 0.18)',

  // Legacy aliases (backwards compat — não quebrar telas existentes)
  textInverseAlt: '#FFFFFF',
  patientAlert: '#FFE4E4',
  borderLight: '#EFEAF8',
  warning: '#FF8A00',
  secondary: '#00B894',
  secondaryDark: '#059669',
  tertiary: '#FF8A00',
};

export const gradients = {
  // Signature AURA: roxo → magenta → laranja (logo + botões)
  aura: ['#6A23D9', '#FF2D7A', '#FF8A00'] as const,
  auraSoft: ['#F1EEFF', '#FFE4E4', '#FFEFD6'] as const,
  primary: ['#6A23D9', '#9B6BFF'] as const,
  pinkOrange: ['#FF2D7A', '#FF8A00'] as const,
  teal: ['#00B894', '#059669'] as const,
  sos: ['#FF3B30', '#C92A1F'] as const,
  hero: ['#F6F3FF', '#FFF7FA', '#FFEFE4'] as const,
  bgWarm: ['#F6F3FF', '#FFF7FA'] as const,
  patientHero: ['#FFF7FA', '#FFEFE4', '#F6F3FF'] as const,
  glassDark: ['rgba(27,18,64,0.85)', 'rgba(60,30,120,0.95)'] as const,
  splash: ['#F6F3FF', '#F1EEFF', '#FFE4E4', '#FFEFD6'] as const,
  cardGlow: ['rgba(106,35,217,0.06)', 'rgba(255,45,122,0.04)'] as const,
  darkMode: ['#1B1240', '#2B1B5C', '#3D1F6E'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  pill: 999,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  h3: 28,
  h2: 32,
  h1: 40,
  patientBody: 22,
  patientH1: 38,
  patientButton: 26,
};

// Manrope — modern, friendly, premium
export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const shadows = {
  sm: {
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 3,
  },
  card: {
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 10,
  },
  glow: {
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.30,
    shadowRadius: 28,
    elevation: 8,
  },
};

export const SLOGAN = 'Cuidar de quem você ama faz tudo valer mais.';
export const APP_NAME = 'Aura';
