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

type ActivityType = 'note' | 'incident' | 'meal' | 'mood';

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  reported_by_name: string;
  reported_at: string;
}

const TYPES: { id: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { id: 'note', label: 'Anotação', icon: 'create-outline', color: colors.secondary },
  { id: 'incident', label: 'Incidente', icon: 'warning', color: colors.sos },
  { id: 'meal', label: 'Refeição', icon: 'restaurant', color: colors.tertiary },
  { id: 'mood', label: 'Humor', icon: 'happy-outline', color: colors.primary },
];

export default function ActivitiesScreen() {
  const { activePatient } = useActivePatient();
  const [list, setList] = useState<Activity[]>([]);
  const [type, setType] = useState<ActivityType>('note');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const { data } = await api.get<Activity[]>('/activities', { params: { patient_id: activePatient.id } });
      setList(data);
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!text.trim()) {
      Alert.alert('Atenção', 'Descreva a atividade');
      return;
    }
    setSaving(true);
    try {
      await api.post('/activities', {
        patient_id: activePatient!.id,
        type,
        description: text.trim(),
      });
      setText('');
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
          <LinkPatientCard role="caregiver" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
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
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Reportar atividade</Text>
          <PatientSwitcher />

          <View style={styles.typesRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                testID={`activity-type-${t.id}`}
                style={[styles.typeBtn, type === t.id && { borderColor: t.color, backgroundColor: '#FFF5F0' }]}
                onPress={() => setType(t.id)}
              >
                <Ionicons name={t.icon} size={20} color={type === t.id ? t.color : colors.textSecondary} />
                <Text
                  style={[styles.typeLabel, type === t.id && { color: t.color, fontWeight: '700' }]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            testID="activity-text-input"
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Descreva o que aconteceu..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity
            testID="activity-submit"
            style={[styles.submit, saving && { opacity: 0.6 }]}
            onPress={submit}
            disabled={saving}
          >
            <Ionicons name="paper-plane" size={18} color={colors.textInverse} />
            <Text style={styles.submitText}>Enviar report</Text>
          </TouchableOpacity>

          <Text style={styles.subtitle}>Histórico</Text>
          {list.length === 0 ? (
            <Text style={styles.empty}>Nenhum report ainda</Text>
          ) : (
            list.map((a) => {
              const t = TYPES.find((x) => x.id === a.type);
              return (
                <View key={a.id} style={styles.card}>
                  <View style={[styles.iconBox, { backgroundColor: (t?.color || colors.secondary) + '22' }]}>
                    <Ionicons name={t?.icon || 'document'} size={20} color={t?.color || colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardType}>{t?.label}</Text>
                    <Text style={styles.cardDesc}>{a.description}</Text>
                    <Text style={styles.cardMeta}>
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
              );
            })
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
  typesRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, gap: 4 },
  typeLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  textArea: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, minHeight: 100, textAlignVertical: 'top', fontSize: fontSizes.base, color: colors.textPrimary },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: spacing.md, borderRadius: radii.md, gap: 8 },
  submitText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: '700' },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, padding: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardType: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  cardDesc: { fontSize: fontSizes.base, color: colors.textPrimary, marginTop: 2 },
  cardMeta: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
});
