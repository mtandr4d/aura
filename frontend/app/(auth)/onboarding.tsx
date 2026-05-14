// Onboarding premium Aura — 3 telas com transições suaves e ilustrações
// IMPORTANTE: NENHUM input nessa tela. Animações apenas decorativas (fade/slide).
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  Platform,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radii, spacing } from '../../lib/theme';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraButton } from '../../components/AuraButton';
import { PressableScale } from '../../lib/animations';
import { markOnboardingSeen } from '../../lib/onboarding';
import { sounds } from '../../lib/sounds';

const HEART = require('../../assets/images/aura-heart.png');
const { width } = Dimensions.get('window');

type Slide = {
  id: string;
  emoji?: string;
  showLogo?: boolean;
  title: string;
  highlight?: string;
  description: string;
  badges?: { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }[];
};

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    showLogo: true,
    title: 'Bem-vindo ao',
    highlight: 'Aura',
    description: 'Cuidar de quem você ama faz tudo valer mais.',
    badges: [
      { icon: 'heart', color: '#FF2D7A', bg: '#FFE4EE' },
      { icon: 'calendar', color: '#6A23D9', bg: '#F1EEFF' },
      { icon: 'notifications', color: '#FF8A00', bg: '#FFF1DD' },
    ],
  },
  {
    id: 'connection',
    emoji: '💞',
    title: 'Conexões',
    highlight: 'que importam',
    description: 'Aproxime-se de quem você ama e esteja sempre por perto, em tempo real.',
  },
  {
    id: 'care',
    emoji: '🌿',
    title: 'Cuidado em',
    highlight: 'cada detalhe',
    description: 'Lembretes, consultas, medicação e exercícios para a memória — tudo no seu ritmo.',
  },
  {
    id: 'all',
    emoji: '✨',
    title: 'Tudo em',
    highlight: 'um só lugar',
    description: 'Prático, seguro e feito para tornar o cuidado mais leve e cheio de amor.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = async () => {
    sounds.play('tap');
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      await markOnboardingSeen();
      router.replace('/(auth)/login');
    }
  };

  const skip = async () => {
    sounds.play('tap');
    await markOnboardingSeen();
    router.replace('/(auth)/login');
  };

  const renderItem: ListRenderItem<Slide> = ({ item }) => (
    <View style={styles.slide}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.illu}>
        {item.showLogo ? (
          <View style={styles.logoCircle}>
            <Image source={HEART} style={styles.logoImg} resizeMode="contain" />
          </View>
        ) : (
          <View style={styles.emojiHalo}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
        )}
        {item.badges && (
          <View style={styles.badgeWrap} pointerEvents="none">
            {item.badges.map((b, i) => (
              <View
                key={i}
                style={[
                  styles.badge,
                  {
                    backgroundColor: b.bg,
                    top: [40, 120, 220][i],
                    [i === 1 ? 'left' : 'right']: i === 1 ? -10 : -16,
                  } as any,
                ]}
              >
                <Ionicons name={b.icon} size={22} color={b.color} />
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(150).duration(500)} style={styles.copy}>
        <Text style={styles.title}>
          {item.title}
          {item.highlight ? ' ' : ''}
          {item.highlight && <Text style={styles.highlight}>{item.highlight}</Text>}
        </Text>
        <Text style={styles.desc}>{item.description}</Text>
      </Animated.View>
    </View>
  );

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <AuraBackground variant="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Skip */}
        <View style={styles.topBar}>
          {!isLast ? (
            <PressableScale haptic="light" onPress={skip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Pular</Text>
            </PressableScale>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Slides */}
        <FlatList
          ref={listRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(s) => s.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Action */}
        <View style={styles.actions}>
          <AuraButton
            title={isLast ? 'Começar agora' : 'Continuar'}
            onPress={goNext}
            iconRight="arrow-forward"
            large
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  skipText: { fontFamily: fonts.bold, color: colors.textSecondary, fontSize: fontSizes.base },

  slide: {
    width,
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illu: {
    width: 240,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2D7A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  logoImg: { width: 130, height: 130 },
  emojiHalo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 8,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(20px)' } as any) : {}),
  },
  emoji: { fontSize: 96 },
  badgeWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A23D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  copy: { alignItems: 'center' },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 38,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  highlight: { color: colors.pink },
  desc: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderSoft,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.pink,
  },

  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
