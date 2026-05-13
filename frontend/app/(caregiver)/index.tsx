import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { useActivePatient } from '../../lib/active-patient';
import { api } from '../../lib/api';
import LinkPatientCard from '../../components/LinkPatientCard';
import PatientSwitcher from '../../components/PatientSwitcher';
import { colors, fontSizes, radii, spacing } from '../../lib/theme';

interface Activity {
  id: string;
  type: string;
  description: string;
  reported_by_name: string;
  reported_at: string;
}

interface Medication {
  id: string;
  name: string;
  schedule_time: string;
}

interface SOSAlert {
  id: string;
  message: string;
  resolved: boolean;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export default function CaregiverHome() {
  const { user, signOut } = useAuth();
  const { activePatient, loadingPatients } = useActivePatient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [sos, setSos] = useState<SOSAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const [a, m, s] = await Promise.all([
        api.get<Activity[]>('/activities', { params: { patient_id: activePatient.id } }),
        api.get<Medication[]>('/medications', { params: { patient_id: activePatient.id } }),
        api.get<SOSAlert[]>('/sos', { params: { patient_id: activePatient.id } }),
      ]);
      setActivities(a.data.slice(0, 5));
      setMeds(m.data);
      setSos(s.data.filter((x) => !x.resolved).slice(0, 3));
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Olá, {user?.full_name?.split(' ')[0]}</Text>
            <Text style={styles.role}>Cuidador</Text>
          </View>
          <TouchableOpacity testID="caregiver-logout" style={styles.iconBtn} onPress={signOut}>
            <Ionicons name="log-out-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {!activePatient && !loadingPatients ? (
          <LinkPatientCard role="caregiver" />
        ) : (
          <>
            <PatientSwitcher />

            {sos.length > 0 ? (
              <View style={styles.sosBanner}>
                <Ionicons name="alert-circle" size={28} color={colors.textInverse} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sosTitle}>SOS ativo!</Text>
                  <Text style={styles.sosMsg}>{sos[0].message}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="medkit" size={26} color={colors.secondary} />
                <Text style={styles.statValue}>{meds.length}</Text>
                <Text style={styles.statLabel}>Medicamentos</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="document-text" size={26} color={colors.primary} />
                <Text style={styles.statValue}>{activities.length}</Text>
                <Text style={styles.statLabel}>Reports recentes</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Atividades recentes</Text>
              {activities.length === 0 ? (
                <Text style={styles.empty}>Nenhuma atividade ainda. Vá na aba Reportar.</Text>
              ) : (
                activities.map((a) => (
                  <View key={a.id} style={styles.activityCard}>
                    <View style={[styles.dot, a.type === 'incident' && { backgroundColor: colors.sos }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityType}>{labelType(a.type)}</Text>
                      <Text style={styles.activityDesc}>{a.description}</Text>
                      <Text style={styles.activityMeta}>
                        {a.reported_by_name} • {formatDate(a.reported_at)}
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

function labelType(t: string) {
  switch (t) {
    case 'note':
      return 'Anotação';
    case 'incident':
      return 'Incidente';
    case 'meal':
      return 'Refeição';
    case 'mood':
      return 'Humor';
    default:
      return t;
  }
}

export function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.textPrimary },
  role: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  iconBtn: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  sosBanner: { flexDirection: 'row', backgroundColor: colors.sos, padding: spacing.md, borderRadius: radii.lg, alignItems: 'center', gap: spacing.md },
  sosTitle: { color: colors.textInverse, fontSize: fontSizes.lg, fontWeight: '800' },
  sosMsg: { color: colors.textInverse, fontSize: fontSizes.sm },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, gap: 4 },
  statValue: { fontSize: fontSizes.h3, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, padding: spacing.md },
  activityCard: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  dot: { width: 8, height: 8, backgroundColor: colors.secondary, borderRadius: 4, marginTop: 8 },
  activityType: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  activityDesc: { fontSize: fontSizes.base, color: colors.textPrimary, marginTop: 2 },
  activityMeta: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
});
