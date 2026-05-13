// AuraInput — Glassmorphism input with icon + focus glow
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '../lib/animations';
import { colors, fonts, fontSizes, radii, spacing } from '../lib/theme';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  testID?: string;
}

export function AuraInput({ label, icon, rightIcon, onRightIconPress, style, testID, ...props }: Props) {
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
            style={{ marginRight: 10 }}
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
          <PressableScale haptic="light" onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' as any } : {}),
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
