// ThemeToggle — Switch sol/lua premium para alternar dark mode
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme-context';
import { PressableScale } from '../lib/animations';
import { sounds } from '../lib/sounds';

interface Props {
  size?: number;
  testID?: string;
}

export function ThemeToggle({ size = 40, testID = 'theme-toggle' }: Props) {
  const { isDark, toggleMode, colors } = useTheme();

  return (
    <PressableScale
      testID={testID}
      haptic="light"
      onPress={() => {
        sounds.play('tap');
        toggleMode();
      }}
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,0.18)' : colors.border,
        },
      ]}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={size * 0.5}
        color={isDark ? '#FFC700' : colors.primary}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
});
