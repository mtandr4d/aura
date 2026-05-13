import React from 'react';
import { Platform, Pressable, PressableProps, ViewStyle, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  scaleTo?: number;
  style?: ViewStyle | ViewStyle[];
}

export function PressableScale({
  children,
  haptic = 'light',
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const triggerHaptic = () => {
    if (haptic === 'none' || Platform.OS === 'web') return;
    if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (haptic === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // IMPORTANTE: usamos Pressable normal + Animated.View interno.
  // O `AnimatedPressable` (createAnimatedComponent + transform) tem bug conhecido
  // em production builds Android que bloqueia toques em formulários e botões.
  // Padrão correto: pointerEvents="box-none" no wrapper VIEW, NUNCA no Animated.View
  // (que com transform vira gesture interceptor e bloqueia toques no Android).
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
        triggerHaptic();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={style as any}
    >
      <View pointerEvents="box-none">
        <Animated.View style={animStyle}>
          {children as any}
        </Animated.View>
      </View>
    </Pressable>
  );
}

interface PulseProps {
  children: React.ReactNode;
  active?: boolean;
  intensity?: number; // amount of scale increase
  duration?: number;
  style?: ViewStyle;
}

export function Pulse({ children, active = true, intensity = 0.04, duration = 1400, style }: PulseProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1 + intensity, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [active, intensity, duration, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  // pointerEvents="box-none" no Animated.View do Pulse é OK pois ele é DECORATIVO
  // e os filhos (PressableScale dentro) precisam receber toques.
  return <Animated.View style={[animStyle, style]} pointerEvents="box-none">{children}</Animated.View>;
}

// Easy entering animation wrappers
export const FadeInView = ({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) => (
  <Animated.View entering={FadeIn.delay(delay).duration(450)} style={style as any}>
    {children}
  </Animated.View>
);

export const SlideUpView = ({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) =>
  // Em web e Android usamos View simples para garantir que touches funcionem corretamente.
  // springify() do reanimated tem bugs conhecidos em production builds Android que bloqueiam
  // eventos de toque em inputs e botões dentro do Animated.View.
  Platform.OS === 'ios' ? (
    <Animated.View entering={FadeInUp.delay(delay).duration(450)} style={style as any}>
      {children}
    </Animated.View>
  ) : (
    <View style={style as any}>{children}</View>
  );

export const SlideDownView = ({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) =>
  Platform.OS === 'ios' ? (
    <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={style as any}>
      {children}
    </Animated.View>
  ) : (
    <View style={style as any}>{children}</View>
  );

// Used to wrap each sibling in a list for staggered entrance
export function StaggerList({
  children,
  baseDelay = 0,
  stagger = 70,
}: {
  children: React.ReactNode;
  baseDelay?: number;
  stagger?: number;
}) {
  return (
    <>
      {React.Children.map(children, (child, i) => (
        <SlideUpView delay={baseDelay + i * stagger}>{child}</SlideUpView>
      ))}
    </>
  );
}

// Skeleton block with shimmer
export function Skeleton({ height = 16, width = '100%', radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  const opacity = useSharedValue(0.6);
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.6, { duration: 700 })),
      -1,
      false,
    );
  }, [opacity]);
  const s = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ height, width: width as any, borderRadius: radius, backgroundColor: '#E0DCD3' }, s]} />;
}

export const Triggers = {
  light: () => Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// Re-export useful primitives
export { default as Animated } from 'react-native-reanimated';
export { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence };
