// Heart Formation Animation — conforme referência
// Animação do coração se formando por etapas usando Path e SVG
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Path do coração (coordenadas simplificadas)
const HEART_PATH =
  'M50,30 C50,22 42,15 35,15 C29,15 24,19 22,24 C20,19 15,15 9,15 C2,15 -6,22 -6,30 C-6,44 10,58 22,68 C34,58 50,44 50,30 Z';

interface Props {
  size?: number;
  onComplete?: () => void;
}

export function HeartAnimation({ size = 140, onComplete }: Props) {
  // Animação stages
  const progress = useSharedValue(0); // 0 -> 1 ao longo da animação
  const glowPulse = useSharedValue(0);
  const circleScale = useSharedValue(0);

  useEffect(() => {
    // Etapa 1-2: Ponto inicial + expansão do círculo (0-900ms)
    circleScale.value = withSequence(
      withTiming(0.3, { duration: 200 }),
      withTiming(1.2, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    // Etapa 3: Desenho do coração (900-1800ms)
    progress.value = withDelay(
      900,
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
    );

    // Etapa 4: Glow pulsante contínuo (a partir de 1800ms)
    setTimeout(() => {
      glowPulse.value = withSequence(
        withDelay(
          200,
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      );
      onComplete?.();
    }, 1800);
  }, [progress, glowPulse, circleScale, onComplete]);

  const animatedPathProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: interpolate(progress.value, [0, 1], [300, 0], Extrapolate.CLAMP),
    };
  });

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      r: interpolate(circleScale.value, [0, 1.2], [5, size * 0.6]),
      opacity: interpolate(circleScale.value, [0, 0.5, 1, 1.2], [1, 0.6, 0.3, 0]),
    };
  });

  const animatedGlowProps = useAnimatedProps(() => {
    return {
      opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.7]),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="-10 10 60 60">
        <Defs>
          <RadialGradient id="heartGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FF2D7A" stopOpacity="1" />
            <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#6A23D9" stopOpacity="0.8" />
          </RadialGradient>
        </Defs>

        {/* Círculo expansivo (início) */}
        <AnimatedCircle cx="22" cy="40" fill="#FFFFFF" animatedProps={animatedCircleProps} />

        {/* Glow sutil atrás do coração */}
        <AnimatedCircle
          cx="22"
          cy="40"
          r={size * 0.35}
          fill="url(#heartGradient)"
          opacity={0.3}
          animatedProps={animatedGlowProps}
        />

        {/* Path do coração sendo desenhado */}
        <AnimatedPath
          d={HEART_PATH}
          stroke="url(#heartGradient)"
          strokeWidth="2.5"
          fill="url(#heartGradient)"
          fillOpacity={progress}
          strokeDasharray="300"
          strokeLinecap="round"
          animatedProps={animatedPathProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
