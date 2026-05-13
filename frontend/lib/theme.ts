// =============================================================
// AURA Design Tokens — Premium iOS / Glassmorphism aesthetic
// Brand palette: Purple, Pink, Orange, Teal, Deep Navy
// "Cuidar de quem você ama faz tudo valer mais."
// =============================================================
export const colors = {
  // Brand core
  purple: '#5B21B6',
  pink: '#EC4899',
  orange: '#FF8A00',
  teal: '#00B894',
  navy: '#0F172A',

  // Semantic aliases
  primary: '#5B21B6',
  primaryDark: '#4C1D95',
  primaryLight: '#8B5CF6',
  accent: '#EC4899',
  accentSoft: '#FBCFE8',
  warm: '#FF8A00',
  success: '#00B894',
  successDark: '#059669',
  sos: '#EF4444',
  sosDark: '#B91C1C',

  // Surfaces
  bg: '#FAFAFC',
  bgSoft: '#F3F1F8',
  bgPatient: '#FFFBF6',
  card: '#FFFFFF',
  glass: 'rgba(255,255,255,0.72)',
  glassDark: 'rgba(15,23,42,0.55)',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  patientText: '#0F172A',

  // Borders & shadows
  border: '#E2E8F0',
  borderSoft: '#EDE9F5',
  shadow: 'rgba(91, 33, 182, 0.10)',
  shadowStrong: 'rgba(15, 23, 42, 0.18)',

  // Legacy aliases (backwards compat)
  textInverseAlt: '#FFFFFF',
  patientAlert: '#FEE2E2',
  borderLight: '#EDE9F5',
  warning: '#FF8A00',
  secondary: '#00B894',
  secondaryDark: '#059669',
  tertiary: '#FF8A00',
};

export const gradients = {
  // Signature AURA: purple → pink → orange (heart logo gradient)
  aura: ['#5B21B6', '#EC4899', '#FF8A00'] as const,
  auraSoft: ['#EDE9FE', '#FCE7F3', '#FFEDD5'] as const,
  primary: ['#5B21B6', '#8B5CF6'] as const,
  pinkOrange: ['#EC4899', '#FF8A00'] as const,
  teal: ['#00B894', '#059669'] as const,
  sos: ['#EF4444', '#B91C1C'] as const,
  hero: ['#5B21B6', '#7C3AED', '#EC4899'] as const,
  bgWarm: ['#FAFAFC', '#F3F1F8'] as const,
  patientHero: ['#FFFBF6', '#FFF1E5'] as const,
  glassDark: ['rgba(91,33,182,0.92)', 'rgba(15,23,42,0.95)'] as const,
  splash: ['#5B21B6', '#7C3AED', '#EC4899', '#FF8A00'] as const,
  cardGlow: ['rgba(91,33,182,0.06)', 'rgba(236,72,153,0.04)'] as const,
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
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 5,
  },
  lg: {
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 10,
  },
  glow: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const SLOGAN = 'Cuidar de quem você ama faz tudo valer mais.';
export const APP_NAME = 'Aura';
