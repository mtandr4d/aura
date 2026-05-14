// Skeleton premium Aura — pulse shimmer com gradient
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radii, spacing } from '../lib/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 14, radius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius: radius,
          backgroundColor: '#EFEAF8',
        },
        animStyle,
        style,
      ]}
    />
  );
}

// ============ SKELETONS POR CONTEXTO ============

export function SkeletonCardSmall() {
  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={44} height={44} radius={22} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="60%" height={12} />
          <Skeleton width="40%" height={10} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonActivityCard() {
  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="50%" height={14} />
          <Skeleton width="30%" height={10} />
        </View>
        <Skeleton width={24} height={24} radius={12} />
      </View>
    </View>
  );
}

export function SkeletonHeader() {
  return (
    <View style={{ marginBottom: spacing.md, gap: 8 }}>
      <Skeleton width="40%" height={22} />
      <Skeleton width="60%" height={12} />
    </View>
  );
}

export function SkeletonList({ count = 3, type = 'card' }: { count?: number; type?: 'card' | 'small' }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: count }).map((_, i) =>
        type === 'small' ? <SkeletonCardSmall key={i} /> : <SkeletonActivityCard key={i} />,
      )}
    </View>
  );
}

export function SkeletonHomeScreen() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.lg }}>
      <SkeletonHeader />
      <View>
        <Skeleton width="30%" height={14} style={{ marginBottom: spacing.sm }} />
        <SkeletonList count={2} type="card" />
      </View>
      <View>
        <Skeleton width="30%" height={14} style={{ marginBottom: spacing.sm }} />
        <SkeletonList count={3} type="small" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
});
