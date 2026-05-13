import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { useActivePatient } from '../../lib/active-patient';
import { api, apiError } from '../../lib/api';
import LinkPatientCard from '../../components/LinkPatientCard';
import PatientSwitcher from '../../components/PatientSwitcher';
import { colors, fontSizes, radii, spacing } from '../../lib/theme';

interface SOSAlert {
  id: string;
  patient_name: string;
  message: string;
  resolved: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  reported_by_name: string;
  reported_at: string;
}

export default function ResponsibleHome() {
  const { user, signOut } = useAuth();
  const { activePatient, loadingPatients } = useActivePatient();
  const [sos, setSos] = useState<SOSAlert[]>([]);
  const [loc, setLoc] = useState<LocationData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const [s, l, a] = await Promise.all([
        api.get<SOSAlert[]>('/sos', { params: { patient_id: activePatient.id } }),
        api.get<LocationData | null>(`/location/${activePatient.id}`),
        api.get<Activity[]>('/activities', { params: { patient_id: activePatient.id } }),
      ]);
      setSos(s.data);
      setLoc(l.data);
      setActivities(a.data.slice(0, 5));
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openMaps = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps://?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
      default: `https://www.google.com/maps?q=${lat},${lng}`,
    });
    Linking.openURL(url!).catch(() =>
      Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`),
    );
  };

  const resolveSOS = async (id: string) => {
    try {
      await api.patch(`/sos/${id}/resolve`);
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    }
  };

  const activeSos = sos.filter((s) => !s.resolved);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Olá, {user?.full_name?.split(' ')[0]}</Text>
            <Text style={styles.role}>Responsável</Text>
          </View>
          <TouchableOpacity testID="responsible-logout" style={styles.iconBtn} onPress={signOut}>
            <Ionicons name="log-out-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {!activePatient && !loadingPatients ? (
          <LinkPatientCard role="responsible" />
        ) : (
          <>
            <PatientSwitcher />

            {activeSos.length > 0 ? (
              <View style={styles.sosCard}>
                <View style={styles.sosHeader}>
                  <Ionicons name="alert-circle" size={28} color={colors.textInverse} />
                  <Text style={styles.sosTitle}>SOS ativo!</Text>
                </View>
                <Text style={styles.sosMsg}>{activeSos[0].message}</Text>
                <Text style={styles.sosTime}>
                  {new Date(activeSos[0].created_at).toLocaleString('pt-BR')}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  {activeSos[0].latitude && activeSos[0].longitude ? (
                    <TouchableOpacity
                      style={styles.sosBtn}
                      onPress={() => openMaps(activeSos[0].latitude!, activeSos[0].longitude!)}
                    >
                      <Ionicons name="navigate" size={16} color={colors.sos} />
                      <Text style={styles.sosBtnText}>Ver no mapa</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    testID="resolve-sos"
                    style={[styles.sosBtn, { backgroundColor: '#FFFFFF' }]}
                    onPress={() => resolveSOS(activeSos[0].id)}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.sos} />
                    <Text style={styles.sosBtnText}>Resolver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <View style={styles.mapCard}>
              <View style={styles.mapHeader}>
                <Ionicons name="location" size={22} color={colors.primary} />
                <Text style={styles.mapTitle}>Localização atual</Text>
              </View>
              {loc ? (
                <>
                  <View style={styles.coordsBox}>
                    <Text testID="patient-coords" style={styles.coordsText}>
                      {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                    </Text>
                    <Text style={styles.coordsTime}>
                      Atualizado {new Date(loc.timestamp).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    testID="open-on-map"
                    style={styles.mapBtn}
                    onPress={() => openMaps(loc.latitude, loc.longitude)}
                  >
                    <Ionicons name="navigate" size={18} color={colors.textInverse} />
                    <Text style={styles.mapBtnText}>Abrir no mapa</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.empty}>
                  Nenhuma localização ainda. Peça para o paciente abrir o app.
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reports recentes</Text>
              {activities.length === 0 ? (
                <Text style={styles.empty}>Nenhum report ainda</Text>
              ) : (
                activities.map((a) => (
                  <View key={a.id} style={styles.activityCard}>
                    <View style={[styles.dot, a.type === 'incident' && { backgroundColor: colors.sos }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityDesc}>{a.description}</Text>
                      <Text style={styles.activityMeta}>
                        {a.reported_by_name} •{' '}
                        {new Date(a.reported_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.textPrimary },
  role: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  iconBtn: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  sosCard: { backgroundColor: colors.sos, padding: spacing.md, borderRadius: radii.lg, gap: 4 },
  sosHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sosTitle: { color: colors.textInverse, fontSize: fontSizes.lg, fontWeight: '800' },
  sosMsg: { color: colors.textInverse, fontSize: fontSizes.base },
  sosTime: { color: '#FFFFFFCC', fontSize: fontSizes.xs },
  sosBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFFEE', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md },
  sosBtnText: { color: colors.sos, fontSize: fontSizes.sm, fontWeight: '700' },
  mapCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mapTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary },
  coordsBox: { backgroundColor: colors.bg, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  coordsText: { fontSize: fontSizes.base, fontWeight: '700', color: colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  coordsTime: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, padding: spacing.md, borderRadius: radii.md },
  mapBtnText: { color: colors.textInverse, fontWeight: '700' },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, padding: spacing.sm },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
  activityCard: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  dot: { width: 8, height: 8, backgroundColor: colors.secondary, borderRadius: 4, marginTop: 8 },
  activityDesc: { fontSize: fontSizes.base, color: colors.textPrimary },
  activityMeta: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
});
