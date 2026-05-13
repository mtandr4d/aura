import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, apiError } from '../lib/api';
import { useActivePatient } from '../lib/active-patient';
import { colors, fontSizes, radii, spacing } from '../lib/theme';

export default function LinkPatientCard({ role }: { role: 'caregiver' | 'responsible' }) {
  const { refreshPatients } = useActivePatient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) {
      Alert.alert('Atenção', 'Digite o código do paciente (6 letras/números)');
      return;
    }
    setLoading(true);
    try {
      await api.post('/patients/link', { patient_code: c });
      Alert.alert('Pronto!', 'Paciente vinculado.');
      setCode('');
      await refreshPatients();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="people" size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>Vincular paciente</Text>
      <Text style={styles.sub}>
        {role === 'caregiver'
          ? 'Peça o código do paciente para começar a cuidar.'
          : 'Peça o código do seu familiar para acompanhá-lo.'}
      </Text>
      <View style={styles.inputWrap}>
        <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
        <TextInput
          testID="link-patient-code-input"
          style={styles.input}
          placeholder="ABC123"
          placeholderTextColor={colors.textSecondary}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={8}
        />
      </View>
      <TouchableOpacity
        testID="link-patient-submit"
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.btnText}>Vincular</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.textPrimary },
  sub: { fontSize: fontSizes.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fontSizes.xl,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: colors.textInverse, fontSize: fontSizes.lg, fontWeight: '700' },
});
