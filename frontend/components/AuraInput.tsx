// AuraInput — Input estilo iOS pill com ícone, conforme referência oficial Aura
// IMPORTANTE: NÃO usar AnimatedPressable em volta de inputs (bug Android APK)
// Foco "iluminado" feito apenas via mudança de borderColor + shadow estático
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radii, spacing } from '../lib/theme';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  testID?: string;
}

export function AuraInput({
  label,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  testID,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.wrap, focused && styles.focused]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.iconLeft}
          />
        )}
        <TextInput
          testID={testID}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style as any]}
        />
        {rightIcon && (
          // Pressable PURO (sem animação/transform) para não bloquear touches no APK
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            style={({ pressed }) => [
              styles.rightIconBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 54,
    // sombra leve sempre visível para dar profundidade iOS
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  focused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconLeft: { marginRight: 12 },
  rightIconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 0 : 12,
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
});
