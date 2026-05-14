// AuraLogo — usa a imagem oficial da marca Aura
// PROPORÇÕES CORRIGIDAS: coração e círculo maiores para melhor visualização
import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { fonts, shadows } from '../lib/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  showSlogan?: boolean;
  light?: boolean;
}

const FULL_LOGO = require('../assets/images/aura-logo.png');

export function AuraLogo({ size = 100, showWordmark = false, showSlogan = false, light = false }: Props) {
  const { colors } = useTheme();
  
  if (showWordmark) {
    // Imagem oficial completa (logo + wordmark + slogan na própria imagem)
    return (
      <View style={{ alignItems: 'center' }}>
        <Image
          source={FULL_LOGO}
          style={{ width: size * 2.8, height: size * 2.8, resizeMode: 'contain' }}
          accessibilityLabel="Logo Aura"
        />
      </View>
    );
  }

  // Apenas o ícone (coração estilizado) com PROPORÇÕES MAIORES
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[styles.iconWrap, { width: size, height: size, borderRadius: size * 0.22 }]}>
        <View style={styles.imageMask}>
          <Image
            source={FULL_LOGO}
            style={{
              width: size * 1.15, // Aumentado de 1.05 para 1.15
              height: size * 2.1, // Aumentado de 1.9 para 2.1
              marginTop: -size * 0.1, // Ajustado de -0.08 para -0.1
              resizeMode: 'contain',
            }}
            accessibilityLabel="Ícone Aura"
          />
        </View>
      </View>
      {showSlogan && (
        <Text style={[styles.slogan, { color: light ? colors.textInverse : colors.textPrimary }]}>
          Cuidar de quem você <Text style={[styles.sloganAccent, { color: colors.pink }]}>ama</Text> faz tudo valer mais.
        </Text>
      )}
    </View>
  );
}

// Versão com slogan estilizado para usar APÓS a imagem completa
export function AuraSlogan({ light = false, size = 14 }: { light?: boolean; size?: number }) {
  const { colors } = useTheme();
  
  return (
    <Text style={[styles.slogan, { color: light ? 'rgba(255,255,255,0.92)' : colors.textSecondary, fontSize: size }]}>
      Cuidar de quem você <Text style={[styles.sloganAccent, { color: colors.pink, fontSize: size }]}>ama</Text> faz tudo valer mais.
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
    fontFamily: fonts.bold,
  },
});
