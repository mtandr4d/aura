import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
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
import { scheduleMedicationReminder, cancelNotification } from '../../lib/notifications';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule_time: string;
  notes?: string;
}

interface MedLog {
  id: string;
  medication_id: string;
  given: boolean;
  logged_at: string;
  logged_by_name: string;
}

export default function MedicationsScreen() {
  const { activePatient } = useActivePatient();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const [m, l] = await Promise.all([
        api.get<Medication[]>('/medications', { params: { patient_id: activePatient.id } }),
        api.get<MedLog[]>('/medications/logs', { params: { patient_id: activePatient.id } }),
      ]);
      setMeds(m.data);
      setLogs(l.data);
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
  }, [load]);

  const addMed = async () => {
    if (!name || !dosage || !time) {
      Alert.alert('Atenção', 'Preencha nome, dose e horário (HH:MM)');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Atenção', 'Horário deve ser HH:MM, ex: 08:00');
      return;
    }
    setSaving(true);
    try {
      const { data: created } = await api.post('/medications', {
        patient_id: activePatient!.id,
        name,
        dosage,
        schedule_time: time,
      });
      // Schedule daily local reminder on this device
      const notifId = await scheduleMedicationReminder(name, dosage, time);
      if (notifId) {
        try {
          // store notif id on the medication via local storage map keyed by med id
          const key = `cm_notif_${created.id}`;
          // dynamic import storage to avoid circular deps
          const { storage } = await import('../../lib/storage');
          await storage.setItem(key, notifId);
        } catch {
          // ignore
        }
      }
      setName('');
      setDosage('');
      setTime('');
      setShowAdd(false);
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const markGiven = async (med: Medication) => {
    try {
      await api.post('/medications/log', { medication_id: med.id, given: true });
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    }
  };

  const removeMed = async (med: Medication) => {
    Alert.alert('Remover medicamento?', med.name, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/medications/${med.id}`);
            await load();
          } catch (e) {
            Alert.alert('Erro', apiError(e));
          }
        },
      },
    ]);
  };

  if (!activePatient) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: spacing.lg }}>
          <LinkPatientCard role="caregiver" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
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
        <Text style={styles.title}>Medicamentos</Text>
        <PatientSwitcher />

        <TouchableOpacity testID="med-add-button" style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color={colors.textInverse} />
          <Text style={styles.addText}>Novo medicamento</Text>
        </TouchableOpacity>

        {meds.length === 0 ? (
          <Text style={styles.empty}>Nenhum medicamento cadastrado</Text>
        ) : (
          meds
            .slice()
            .sort((a, b) => a.schedule_time.localeCompare(b.schedule_time))
            .map((m) => {
              const today = new Date().toDateString();
              const givenToday = logs.some(
                (l) => l.medication_id === m.id && new Date(l.logged_at).toDateString() === today,
              );
              return (
                <View key={m.id} style={styles.medCard}>
                  <View style={[styles.medAccent, givenToday && { backgroundColor: colors.success }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{m.name}</Text>
                    <Text style={styles.medDosage}>{m.dosage}</Text>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.medTime}>{m.schedule_time}</Text>
                      {givenToday ? <Text style={styles.givenBadge}>✓ Dado hoje</Text> : null}
                    </View>
                  </View>
                  <View style={styles.medActions}>
                    <TouchableOpacity
                      testID={`med-give-${m.id}`}
                      style={[styles.smallAction, givenToday && { opacity: 0.5 }]}
                      onPress={() => markGiven(m)}
                      disabled={givenToday}
                    >
                      <Ionicons name="checkmark-circle" size={26} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeMed(m)} style={styles.smallAction}>
                      <Ionicons name="trash-outline" size={22} color={colors.sos} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
        )}

        <Text style={styles.subtitle}>Histórico</Text>
        {logs.length === 0 ? (
          <Text style={styles.empty}>Sem registros ainda</Text>
        ) : (
          logs.slice(0, 10).map((l) => {
            const med = meds.find((m) => m.id === l.medication_id);
            return (
              <View key={l.id} style={styles.logCard}>
                <Ionicons name="checkmark-done" size={18} color={colors.secondary} />
                <Text style={styles.logText}>
                  {med?.name || 'Medicamento'} • por {l.logged_by_name} •{' '}
                  {new Date(l.logged_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo medicamento</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                testID="med-name-input"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Donepezila"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Dose</Text>
              <TextInput
                testID="med-dosage-input"
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="Ex: 1 comprimido / 10mg"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Horário (HH:MM)</Text>
              <TextInput
                testID="med-time-input"
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="Ex: 08:00"
                placeholderTextColor={colors.textSecondary}
                maxLength={5}
              />
            </View>
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAdd(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="med-save-button"
                style={[styles.modalSave, saving && { opacity: 0.6 }]}
                onPress={addMed}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: fontSizes.h3, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: spacing.md, borderRadius: radii.md, gap: 8 },
  addText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: '700' },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, padding: spacing.sm },
  medCard: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', overflow: 'hidden' },
  medAccent: { width: 6, alignSelf: 'stretch', backgroundColor: colors.secondary, borderRadius: 3, marginRight: spacing.md },
  medName: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary },
  medDosage: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  medTime: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  givenBadge: { marginLeft: 8, fontSize: fontSizes.xs, color: colors.success, fontWeight: '700' },
  medActions: { flexDirection: 'row', gap: 4 },
  smallAction: { padding: spacing.sm },
  logCard: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.sm, borderRadius: radii.sm, gap: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  logText: { flex: 1, fontSize: fontSizes.sm, color: colors.textSecondary },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { backgroundColor: colors.card, padding: spacing.lg, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, gap: spacing.md },
  modalTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.textPrimary },
  field: { gap: 6 },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  input: { backgroundColor: colors.bg, padding: 14, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, fontSize: fontSizes.base, color: colors.textPrimary },
  modalRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalCancel: { flex: 1, padding: 14, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textPrimary, fontWeight: '700' },
  modalSave: { flex: 1, padding: 14, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.primary },
  modalSaveText: { color: colors.textInverse, fontWeight: '700' },
});
