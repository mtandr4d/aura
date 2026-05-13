// Exercícios da Memória — Jogo da memória acessível para idosos
// 3 níveis, cartas grandes, feedback visual e sonoro acolhedor.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { PressableScale, SlideUpView, Triggers } from '../../lib/animations';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraCard } from '../../components/AuraCard';
import { AuraButton } from '../../components/AuraButton';
import { colors, fonts, fontSizes, gradients, radii, shadows, spacing } from '../../lib/theme';
import { sounds } from '../../lib/sounds';

type Level = 'easy' | 'medium' | 'hard';

const LEVELS: Record<Level, { pairs: number; cols: number; label: string; emojis: string[] }> = {
  easy: {
    pairs: 4,
    cols: 2,
    label: 'Fácil',
    emojis: ['🌻', '🐶', '🍎', '🌈'],
  },
  medium: {
    pairs: 6,
    cols: 3,
    label: 'Médio',
    emojis: ['🌻', '🐶', '🍎', '🌈', '🦋', '⭐'],
  },
  hard: {
    pairs: 8,
    cols: 4,
    label: 'Difícil',
    emojis: ['🌻', '🐶', '🍎', '🌈', '🦋', '⭐', '🐱', '🍀'],
  },
};

interface Card {
  id: number;
  emoji: string;
  matched: boolean;
  flipped: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(level: Level): Card[] {
  const cfg = LEVELS[level];
  const ids = shuffle([...cfg.emojis, ...cfg.emojis]);
  return ids.map((emoji, i) => ({ id: i, emoji, matched: false, flipped: false }));
}

export default function MemoryGame() {
  const [level, setLevel] = useState<Level>('easy');
  const [deck, setDeck] = useState<Card[]>(() => buildDeck('easy'));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const cfg = LEVELS[level];
  const finished = useMemo(() => matches === cfg.pairs, [matches, cfg.pairs]);

  const reset = (lvl: Level = level) => {
    setDeck(buildDeck(lvl));
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setStreak(0);
    setLevel(lvl);
  };

  useEffect(() => {
    if (finished) {
      Triggers.success();
      sounds.play('success');
      setTimeout(() => {
        Alert.alert(
          '🎉 Parabéns!',
          `Você completou o nível ${cfg.label} em ${moves} jogadas!\n\nMaior sequência: ${bestStreak}`,
          [
            { text: 'Jogar novamente', onPress: () => reset(level) },
            level !== 'hard'
              ? { text: 'Próximo nível', onPress: () => reset(level === 'easy' ? 'medium' : 'hard') }
              : { text: 'OK', style: 'cancel' },
          ].filter(Boolean) as any,
        );
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const onFlip = (idx: number) => {
    const card = deck[idx];
    if (card.matched || card.flipped || selected.length === 2) return;

    sounds.play('flip');
    Triggers.light();
    const newDeck = deck.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    const newSel = [...selected, idx];
    setDeck(newDeck);
    setSelected(newSel);

    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSel;
      if (newDeck[a].emoji === newDeck[b].emoji) {
        // match
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setSelected([]);
          setMatches((m) => m + 1);
          setStreak((s) => {
            const ns = s + 1;
            setBestStreak((bs) => Math.max(bs, ns));
            return ns;
          });
          Triggers.success();
          sounds.play('match');
        }, 400);
      } else {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setSelected([]);
          setStreak(0);
          sounds.play('error');
          Triggers.warning();
        }, 900);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AuraBackground variant="light" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SlideUpView delay={40}>
            <View style={styles.headerWrap}>
              <View style={styles.titleRow}>
                <View style={styles.titleIcon}>
                  <LinearGradient colors={gradients.pinkOrange} style={StyleSheet.absoluteFill} />
                  <Ionicons name="bulb" size={26} color="#fff" />
                </View>
                <View>
                  <Text style={styles.title}>Exercícios da Memória</Text>
                  <Text style={styles.subtitle}>Encontre os pares iguais</Text>
                </View>
              </View>
            </View>
          </SlideUpView>

          <SlideUpView delay={120}>
            <View style={styles.statsRow}>
              <StatChip icon="game-controller" label="Jogadas" value={moves} />
              <StatChip icon="checkmark-circle" label="Acertos" value={`${matches}/${cfg.pairs}`} accent />
              <StatChip icon="flame" label="Sequência" value={streak} />
            </View>
          </SlideUpView>

          <SlideUpView delay={180}>
            <View style={styles.levelRow}>
              {(Object.keys(LEVELS) as Level[]).map((lv) => {
                const active = level === lv;
                return (
                  <PressableScale
                    key={lv}
                    haptic="light"
                    onPress={() => {
                      sounds.play('tap');
                      reset(lv);
                    }}
                    style={[styles.levelChip, active && styles.levelChipActive] as any}
                  >
                    {active ? (
                      <LinearGradient
                        colors={gradients.aura}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
                      />
                    ) : null}
                    <Text style={[styles.levelText, active && { color: '#fff' }]}>{LEVELS[lv].label}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </SlideUpView>

          <SlideUpView delay={240}>
            <View style={[styles.board, { gap: spacing.sm }]}>
              {Array.from({ length: Math.ceil(deck.length / cfg.cols) }).map((_, rowIdx) => (
                <View key={rowIdx} style={[styles.row, { gap: spacing.sm }]}>
                  {deck
                    .slice(rowIdx * cfg.cols, rowIdx * cfg.cols + cfg.cols)
                    .map((card, i) => {
                      const idx = rowIdx * cfg.cols + i;
                      return <FlipCard key={card.id} card={card} onPress={() => onFlip(idx)} cols={cfg.cols} />;
                    })}
                </View>
              ))}
            </View>
          </SlideUpView>

          <SlideUpView delay={320}>
            <AuraButton
              title="Reiniciar jogo"
              icon="refresh"
              variant="ghost"
              onPress={() => {
                sounds.play('tap');
                reset(level);
              }}
              style={{ marginTop: spacing.lg }}
            />
          </SlideUpView>

          <Text style={styles.hint}>
            💡 Encontrar pares estimula memória e raciocínio. Jogue um pouquinho todos os dias.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatChip({ icon, label, value, accent }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string | number; accent?: boolean }) {
  return (
    <View style={[styles.statChip, accent && styles.statChipAccent]}>
      <Ionicons name={icon} size={18} color={accent ? colors.textInverse : colors.primary} />
      <View>
        <Text style={[styles.statLabel, accent && { color: 'rgba(255,255,255,0.85)' }]}>{label}</Text>
        <Text style={[styles.statValue, accent && { color: '#fff' }]}>{value}</Text>
      </View>
    </View>
  );
}

function FlipCard({ card, onPress, cols }: { card: Card; onPress: () => void; cols: number }) {
  const rot = useSharedValue(card.flipped || card.matched ? 1 : 0);
  const pop = useSharedValue(0);

  useEffect(() => {
    rot.value = withTiming(card.flipped || card.matched ? 1 : 0, { duration: 250 });
    if (card.matched) {
      pop.value = withSequence(withSpring(1.08, { damping: 6 }), withSpring(1, { damping: 8 }));
    }
  }, [card.flipped, card.matched, rot, pop]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: rot.value,
    transform: [{ rotateY: `${(1 - rot.value) * 180}deg` }, { scale: 1 + pop.value * 0.05 }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: 1 - rot.value,
    transform: [{ rotateY: `${rot.value * -180}deg` }],
  }));

  const size = cols === 2 ? 140 : cols === 3 ? 100 : 76;
  const fontSize = cols === 2 ? 64 : cols === 3 ? 50 : 38;

  return (
    <PressableScale haptic="none" onPress={onPress} scaleTo={0.95} style={{ flex: 1 }}>
      <View style={[styles.cardWrap, { height: size }]}>
        <Animated.View style={[styles.cardFace, backStyle]}>
          <LinearGradient
            colors={gradients.aura}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="help" size={size * 0.4} color="#fff" />
        </Animated.View>
        <Animated.View style={[styles.cardFace, styles.cardFront, frontStyle, card.matched && styles.cardMatched]}>
          <Text style={{ fontSize }}>{card.emoji}</Text>
        </Animated.View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  headerWrap: { marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.glow,
  },
  title: { fontSize: fontSizes.xxl, fontFamily: fonts.extrabold, color: colors.navy, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  statChipAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statLabel: { fontSize: 10, fontFamily: fonts.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  statValue: { fontSize: fontSizes.lg, fontFamily: fonts.extrabold, color: colors.textPrimary },
  levelRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  levelChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    overflow: 'hidden',
  },
  levelChipActive: { borderColor: 'transparent' },
  levelText: { fontSize: fontSizes.base, fontFamily: fonts.bold, color: colors.textPrimary },
  board: {},
  row: { flexDirection: 'row' },
  cardWrap: { borderRadius: radii.lg, overflow: 'hidden', ...shadows.card, backgroundColor: '#fff' },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardFront: { backgroundColor: '#fff', borderWidth: 2, borderColor: colors.borderSoft },
  cardMatched: { borderColor: colors.success, backgroundColor: '#ECFDF5' },
  hint: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    marginTop: spacing.md,
    lineHeight: 22,
  },
});
