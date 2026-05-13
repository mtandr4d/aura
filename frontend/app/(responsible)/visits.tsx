import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useActivePatient } from '../../lib/active-patient';
import { api, apiError } from '../../lib/api';
import LinkPatientCard from '../../components/LinkPatientCard';
import PatientSwitcher from '../../components/PatientSwitcher';
import { colors, fontSizes, radii, spacing } from '../../lib/theme';

interface Visit {
  id: string;
  requested_by_name: string;
  requested_date: string;
  reason: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
}

const STATUS_LABEL: Record<Visit['status'], string> = {
  pending: 'Aguardando',
  accepted: 'Aceita',
  declined: 'Recusada',
  completed: 'Concluída',
};
const STATUS_COLOR: Record<Visit['status'], string> = {
  pending: colors.tertiary,
  accepted: colors.secondary,
  declined: colors.sos,
  completed: colors.textSecondary,
};

export default function VisitsScreen() {
  const { activePatient } = useActivePatient();
  const [list, setList] = useState<Visit[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const { data } = await api.get<Visit[]>('/visits', { params: { patient_id: activePatient.id } });
      setList(data);
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!date.trim() || !reason.trim()) {
      Alert.alert('Atenção', 'Preencha data e motivo');
      return;
    }
    setSaving(true);
    try {
      await api.post('/visits', {
        patient_id: activePatient!.id,
        requested_date: date.trim(),
        reason: reason.trim(),
      });
      setDate('');
      setReason('');
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  if (!activePatient) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: spacing.lg }}>
          <LinkPatientCard role="responsible" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
            />
          }
        >
          <Text style={styles.title}>Solicitar visita</Text>
          <PatientSwitcher />

          <View style={styles.addBox}>
            <View style={styles.field}>
              <Text style={styles.label}>Data desejada</Text>
              <TextInput
                testID="visit-date-input"
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="Ex: 25/03 - manhã"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Motivo</Text>
              <TextInput
                testID="visit-reason-input"
                style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                value={reason}
                onChangeText={setReason}
                placeholder="Ex: Consulta médica, ir ao banco..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            </View>
            <TouchableOpacity
              testID="visit-submit"
              style={[styles.submit, saving && { opacity: 0.6 }]}
              onPress={submit}
              disabled={saving}
            >
              <Ionicons name="calendar" size={18} color={colors.textInverse} />
              <Text style={styles.submitText}>Solicitar visita</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Histórico</Text>
          {list.length === 0 ? (
            <Text style={styles.empty}>Nenhuma visita solicitada</Text>
          ) : (
            list.map((v) => (
              <View key={v.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLOR[v.status] + '22' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLOR[v.status] }]}>
                      {STATUS_LABEL[v.status]}
                    </Text>
                  </View>
                  <Text style={styles.cardDate}>{v.requested_date}</Text>
                </View>
                <Text style={styles.cardReason}>{v.reason}</Text>
                <Text style={styles.cardMeta}>
                  Por {v.requested_by_name} •{' '}
                  {new Date(v.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: fontSizes.h3, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg },
  addBox: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  field: { gap: 6 },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  input: { backgroundColor: colors.bg, padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, fontSize: fontSizes.base, color: colors.textPrimary },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 12, borderRadius: radii.md, gap: 6 },
  submitText: { color: colors.textInverse, fontWeight: '700' },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, padding: spacing.sm },
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  badgeText: { fontSize: fontSizes.xs, fontWeight: '700' },
  cardDate: { fontSize: fontSizes.sm, color: colors.textPrimary, fontWeight: '700' },
  cardReason: { fontSize: fontSizes.base, color: colors.textPrimary, marginTop: 4 },
  cardMeta: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
});
