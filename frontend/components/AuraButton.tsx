// AuraButton — Premium gradient/glass button with sound + haptic feedback
import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View, ViewStyle, StyleProp, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '../lib/animations';
import { colors, fonts, fontSizes, gradients, radii, shadows, spacing } from '../lib/theme';
import { sounds } from '../lib/sounds';

type Variant = 'primary' | 'pink' | 'orange' | 'teal' | 'ghost' | 'glass' | 'sos';

interface Props {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  large?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  sound?: 'tap' | 'success' | 'error' | 'none';
}

const GRADIENT_MAP: Record<Variant, readonly string[]> = {
  primary: gradients.aura,
  pink: gradients.pinkOrange,
  orange: ['#FF8A00', '#FF5E62'],
  teal: gradients.teal,
  ghost: ['transparent', 'transparent'],
  glass: ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.25)'],
  sos: gradients.sos,
};

export function AuraButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
  iconRight,
  large,
  fullWidth,
  style,
  testID,
  haptic = 'medium',
  sound = 'tap',
}: Props) {
  const isGhost = variant === 'ghost';
  const isGlass = variant === 'glass';
  const textColor = isGhost ? colors.primary : isGlass ? colors.navy : colors.textInverse;

  const handlePress = () => {
    if (sound !== 'none') sounds.play(sound);
    onPress?.();
  };

  return (
    <PressableScale
      testID={testID}
      haptic={disabled ? 'none' : haptic}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.wrap,
        large && styles.wrapLarge,
        fullWidth && { alignSelf: 'stretch' },
        disabled && { opacity: 0.55 },
        !isGhost && shadows.sm,
        style,
      ] as any}
    >
      <LinearGradient
        colors={GRADIENT_MAP[variant] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          large && styles.gradientLarge,
          isGhost && styles.ghost,
          isGlass && styles.glass,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.row}>
            {icon && <Ionicons name={icon} size={large ? 22 : 18} color={textColor} />}
            <Text
              style={[
                styles.text,
                large && styles.textLarge,
                { color: textColor },
              ]}
            >
              {title}
            </Text>
            {iconRight && <Ionicons name={iconRight} size={large ? 22 : 18} color={textColor} />}
          </View>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.pill, overflow: 'hidden' },
  wrapLarge: {},
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    minHeight: 52,
  },
  gradientLarge: { paddingVertical: 20, minHeight: 64 },
  ghost: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  glass: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(18px)' as any } : {}),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { fontSize: fontSizes.base, fontFamily: fonts.bold, letterSpacing: 0.2 },
  textLarge: { fontSize: fontSizes.lg },
});
