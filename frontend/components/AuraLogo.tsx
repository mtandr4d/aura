// AuraLogo — usa a imagem oficial da marca Aura
import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { colors, fonts, shadows } from '../lib/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  showSlogan?: boolean;
  light?: boolean;
}

// A imagem original contém logo + wordmark + slogan já compostos.
// Para flexibilidade, oferecemos 3 modos:
//   - size only          → mostra apenas o ícone do coração (recortado da imagem inteira via aspectRatio fixo)
//   - showWordmark       → mostra a imagem inteira (logo + "aura" + slogan)
//   - showSlogan (custom)→ texto do slogan abaixo com a palavra "ama" em rosa
const FULL_LOGO = require('../assets/images/aura-logo.png');

export function AuraLogo({ size = 84, showWordmark = false, showSlogan = false, light = false }: Props) {
  if (showWordmark) {
    // Imagem oficial completa (logo + wordmark + slogan na própria imagem)
    return (
      <View style={{ alignItems: 'center' }}>
        <Image
          source={FULL_LOGO}
          style={{ width: size * 2.4, height: size * 2.4, resizeMode: 'contain' }}
          accessibilityLabel="Logo Aura"
        />
      </View>
    );
  }

  // Apenas o ícone (coração estilizado) recortado do topo da imagem oficial
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[styles.iconWrap, { width: size, height: size, borderRadius: size * 0.22 }]}>
        <View style={styles.imageMask}>
          <Image
            source={FULL_LOGO}
            style={{
              width: size * 1.05,
              height: size * 1.9,
              marginTop: -size * 0.08,
              resizeMode: 'contain',
            }}
            accessibilityLabel="Ícone Aura"
          />
        </View>
      </View>
      {showSlogan && (
        <Text style={[styles.slogan, { color: light ? colors.textInverse : colors.navy }]}>
          Cuidar de quem você <Text style={styles.sloganAccent}>ama</Text> faz tudo valer mais.
        </Text>
      )}
    </View>
  );
}

// Versão com slogan estilizado para usar APÓS a imagem completa
export function AuraSlogan({ light = false, size = 14 }: { light?: boolean; size?: number }) {
  return (
    <Text style={[styles.slogan, { color: light ? 'rgba(255,255,255,0.92)' : colors.navy, fontSize: size }]}>
      Cuidar de quem você <Text style={[styles.sloganAccent, { fontSize: size }]}>ama</Text> faz tudo valer mais.
    </Text>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.glow,
  },
  imageMask: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  slogan: {
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 340,
    lineHeight: 20,
  },
  sloganAccent: {
    color: colors.pink,
    fontFamily: fonts.bold,
  },
});
