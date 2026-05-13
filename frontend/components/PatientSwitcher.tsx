import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivePatient } from '../lib/active-patient';
import { colors, fontSizes, radii, spacing } from '../lib/theme';

export default function PatientSwitcher() {
  const { activePatient, patients, setActive } = useActivePatient();
  if (!activePatient || patients.length === 0) return null;

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color={colors.textInverse} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Paciente</Text>
        <Text testID="active-patient-name" style={styles.name}>{activePatient.full_name}</Text>
      </View>
      {patients.length > 1 ? (
        <TouchableOpacity
          testID="patient-switcher-cycle"
          style={styles.switchBtn}
          onPress={() => {
            const i = patients.findIndex((p) => p.id === activePatient.id);
            const next = patients[(i + 1) % patients.length];
            setActive(next);
          }}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
          <Text style={styles.switchText}>Trocar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600' },
  name: { fontSize: fontSizes.lg, color: colors.textPrimary, fontWeight: '700' },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  switchText: { color: colors.primary, fontSize: fontSizes.sm, fontWeight: '700' },
});
