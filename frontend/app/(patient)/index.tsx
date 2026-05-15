// Patient Home — Aura premium home (SOS, next med, location, code)
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuth } from '../../lib/auth';
import { api, apiError } from '../../lib/api';
import { colors, fonts, fontSizes, gradients, radii, shadows, spacing } from '../../lib/theme';
import { PressableScale, Pulse, SlideUpView, Triggers } from '../../lib/animations';
import { AuraBackground } from '../../components/AuraBackground';
import { AuraCard, AuraGradientCard } from '../../components/AuraCard';
import { sounds } from '../../lib/sounds';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule_time: string;
}

function nextMedicationFromList(meds: Medication[]): Medication | null {
  if (!meds.length) return null;
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const sorted = [...meds].sort((a, b) => {
    const [ah, am] = a.schedule_time.split(':').map(Number);
    const [bh, bm] = b.schedule_time.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
  return sorted.find((m) => {
    const [h, mm] = m.schedule_time.split(':').map(Number);
    return h * 60 + mm >= minutesNow;
  }) || sorted[0];
}

export default function PatientHome() {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locStatus, setLocStatus] = useState<'idle' | 'asking' | 'ok' | 'denied'>('idle');

  const loadMeds = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get<Medication[]>('/medications', { params: { patient_id: user.id } });
      setMeds(data);
    } catch { /* noop */ }
  }, [user]);

  const updateLocation = useCallback(async () => {
    try {
      setLocStatus('asking');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocStatus('denied');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setLocation(coords);
      setLocStatus('ok');
      try {
        await api.post('/location', { latitude: coords.latitude, longitude: coords.longitude, accuracy: pos.coords.accuracy });
      } catch {}
      return coords;
    } catch {
      setLocStatus('denied');
      return null;
    }
  }, []);

  useEffect(() => {
    loadMeds();
    updateLocation();
    const t = setInterval(updateLocation, 60000);
    return () => clearInterval(t);
  }, [loadMeds, updateLocation]);

  const next = useMemo(() => nextMedicationFromList(meds), [meds]);

  const sendSOS = async () => {
    console.log('[SOS] Botão pressionado');
    Triggers.heavy();
    sounds.play('tap');
    Alert.alert(
      'Enviar SOS?',
      'Vamos avisar seu cuidador e família que você precisa de ajuda.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => console.log('[SOS] Cancelado') },
        {
          text: 'SIM, ENVIAR',
          style: 'destructive',
          onPress: async () => {
            console.log('[SOS] Confirmado, enviando...');
            setSending(true);
            try {
              let coords = location;
              if (!coords) {
                console.log('[SOS] Localização não disponível, buscando...');
                coords = await updateLocation();
              }
              console.log('[SOS] Enviando para API...', coords);
              
              const response = await api.post('/sos', {
                latitude: coords?.latitude || null,
                longitude: coords?.longitude || null,
                message: 'SOS - preciso de ajuda',
              });
              
              console.log('[SOS] Resposta da API:', response.data);
              Triggers.success();
              sounds.play('success');
              Alert.alert('Pronto!', 'Sua família foi avisada. Fique tranquilo, você não está sozinho.');
            } catch (e: any) {
              console.error('[SOS] Erro ao enviar:', e);
              console.error('[SOS] Detalhes do erro:', e.response?.data || e.message);
              Triggers.error();
              sounds.play('error');
              Alert.alert('Erro ao enviar SOS', apiError(e) + '\n\nTente novamente ou peça ajuda presencialmente.');
            } finally {
              setSending(false);
            }
          },
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMeds(), updateLocation()]);
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <AuraBackground variant="patient" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <SlideUpView delay={50}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hello}>Olá,</Text>
                <Text testID="patient-name" style={styles.name}>
                  {user?.full_name?.split(' ')[0] || 'Você'} ✨
                </Text>
              </View>
              <View style={styles.statusChip}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ativo</Text>
              </View>
            </View>
          </SlideUpView>

          {user?.patient_code ? (
            <SlideUpView delay={120}>
              <AuraGradientCard colors={gradients.aura} style={{ marginTop: spacing.md }}>
                <Text style={styles.codeLabel}>Seu código de vínculo</Text>
                <Text testID="patient-code" style={styles.codeValue}>{user.patient_code}</Text>
                <Text style={styles.codeHelp}>Mostre para seu cuidador ou família</Text>
              </AuraGradientCard>
            </SlideUpView>
          ) : null}

          <SlideUpView delay={200}>
            <Pulse active={!sending} intensity={0.04} duration={1600}>
              <PressableScale
                testID="patient-sos-button"
                haptic="heavy"
                scaleTo={0.94}
                onPress={sendSOS}
                disabled={sending}
                style={[styles.sosWrap, { marginTop: spacing.lg }]}
              >
                <LinearGradient colors={gradients.sos} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sos}>
                  {sending ? (
                    <ActivityIndicator size="large" color={colors.textInverse} />
                  ) : (
                    <>
                      <Ionicons name="alert-circle" size={56} color={colors.textInverse} />
                      <Text style={styles.sosText}>S O S</Text>
                      <Text style={styles.sosSub}>Toque se precisar de ajuda</Text>
                    </>
                  )}
                </LinearGradient>
              </PressableScale>
            </Pulse>
          </SlideUpView>

          <SlideUpView delay={300}>
            <AuraCard glow style={{ marginTop: spacing.lg }}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBubble, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="medkit" size={22} color={colors.success} />
                </View>
                <Text style={styles.cardTitle}>Próximo remédio</Text>
              </View>
              {next ? (
                <>
                  <Text testID="patient-next-med-name" style={styles.bigText}>{next.name}</Text>
                  <Text style={styles.medDosage}>{next.dosage}</Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={22} color={colors.success} />
                    <Text style={styles.timeText}>{next.schedule_time}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>Nenhum medicamento cadastrado ainda</Text>
              )}
            </AuraCard>
          </SlideUpView>

          <SlideUpView delay={400}>
            <AuraCard style={{ marginTop: spacing.md }}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBubble, { backgroundColor: '#FFEDD5' }]}>
                  <Ionicons name="location" size={22} color={colors.warm} />
                </View>
                <Text style={styles.cardTitle}>Onde você está</Text>
              </View>
              {locStatus === 'denied' ? (
                <>
                  <Text style={styles.emptyText}>Permita o acesso à localização</Text>
                  <PressableScale haptic="light" onPress={updateLocation} style={styles.smallBtn}>
                    <Text style={styles.smallBtnText}>Permitir agora</Text>
                  </PressableScale>
                </>
              ) : location ? (
                <>
                  <Text testID="patient-loc-coords" style={styles.locCoords}>
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </Text>
                  <View style={styles.successRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={styles.successText}>Sua família consegue te ver no mapa</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>Buscando localização...</Text>
              )}
            </AuraCard>
          </SlideUpView>

          <SlideUpView delay={500}>
            <Text style={styles.tip}>
              Aura cuida com você 💜 Sua localização é compartilhada com quem te ama.
            </Text>
          </SlideUpView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: fontSizes.lg, fontFamily: fonts.medium, color: colors.textSecondary },
  name: { fontSize: fontSizes.h1, fontFamily: fonts.extrabold, color: colors.navy, letterSpacing: -1 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { fontSize: fontSizes.xs, fontFamily: fonts.bold, color: colors.successDark },
  codeLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  codeValue: {
    fontSize: 42,
    fontFamily: fonts.extrabold,
    color: colors.textInverse,
    letterSpacing: 6,
    marginTop: 6,
  },
  codeHelp: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  sosWrap: { borderRadius: radii.xl, overflow: 'hidden', ...shadows.lg },
  sos: { paddingVertical: 36, alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 6 },
  sosText: { color: colors.textInverse, fontSize: 56, fontFamily: fonts.extrabold, letterSpacing: 10 },
  sosSub: { color: colors.textInverse, fontSize: fontSizes.lg, fontFamily: fonts.semibold, opacity: 0.95 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.sm },
  iconBubble: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: fontSizes.lg, fontFamily: fonts.bold, color: colors.textPrimary },
  bigText: { fontSize: 30, fontFamily: fonts.extrabold, color: colors.navy, marginTop: 4, letterSpacing: -0.5 },
  medDosage: { fontSize: fontSizes.lg, fontFamily: fonts.semibold, color: colors.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  timeText: { fontSize: 28, fontFamily: fonts.extrabold, color: colors.successDark },
  emptyText: { fontSize: fontSizes.base, fontFamily: fonts.medium, color: colors.textMuted, marginTop: 6 },
  locCoords: { fontSize: fontSizes.base, color: colors.textSecondary, marginTop: 6, fontFamily: fonts.medium },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  successText: { fontSize: fontSizes.sm, fontFamily: fonts.bold, color: colors.successDark },
  smallBtn: { backgroundColor: colors.primary, padding: 12, borderRadius: radii.pill, alignItems: 'center', marginTop: spacing.sm },
  smallBtnText: { color: colors.textInverse, fontSize: fontSizes.base, fontFamily: fonts.bold },
  tip: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    marginTop: spacing.xl,
  },
});
