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

type Cat = 'medicine' | 'food' | 'hygiene' | 'other';

interface ShoppingItem {
  id: string;
  item: string;
  category: Cat;
  quantity: string;
  purchased: boolean;
}

const CATS: { id: Cat; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { id: 'medicine', label: 'Remédios', icon: 'medical', color: colors.sos },
  { id: 'food', label: 'Alimentos', icon: 'fast-food', color: colors.tertiary },
  { id: 'hygiene', label: 'Higiene', icon: 'water', color: colors.secondary },
  { id: 'other', label: 'Outros', icon: 'apps', color: colors.primary },
];

export default function ShoppingScreen() {
  const { activePatient } = useActivePatient();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [cat, setCat] = useState<Cat>('medicine');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const { data } = await api.get<ShoppingItem[]>('/shopping', { params: { patient_id: activePatient.id } });
      setItems(data);
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!item.trim()) {
      Alert.alert('Atenção', 'Digite o item');
      return;
    }
    setSaving(true);
    try {
      await api.post('/shopping', {
        patient_id: activePatient!.id,
        item: item.trim(),
        category: cat,
        quantity: qty.trim() || '1',
      });
      setItem('');
      setQty('');
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (it: ShoppingItem) => {
    try {
      await api.patch(`/shopping/${it.id}`, { purchased: !it.purchased });
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    }
  };

  const remove = async (it: ShoppingItem) => {
    try {
      await api.delete(`/shopping/${it.id}`);
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
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

  const pending = items.filter((i) => !i.purchased);
  const done = items.filter((i) => i.purchased);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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
          <Text style={styles.title}>Lista de compras</Text>
          <PatientSwitcher />

          <View style={styles.addBox}>
            <View style={styles.catRow}>
              {CATS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  testID={`shop-cat-${c.id}`}
                  style={[styles.catBtn, cat === c.id && { borderColor: c.color, backgroundColor: '#FFF5F0' }]}
                  onPress={() => setCat(c.id)}
                >
                  <Ionicons name={c.icon} size={18} color={cat === c.id ? c.color : colors.textSecondary} />
                  <Text
                    style={[styles.catLabel, cat === c.id && { color: c.color, fontWeight: '700' }]}
                    numberOfLines={1}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              <TextInput
                testID="shop-item-input"
                style={[styles.input, { flex: 2 }]}
                placeholder="Item (ex: Donepezila 10mg)"
                placeholderTextColor={colors.textSecondary}
                value={item}
                onChangeText={setItem}
              />
              <TextInput
                testID="shop-qty-input"
                style={[styles.input, { flex: 1 }]}
                placeholder="Qtd"
                placeholderTextColor={colors.textSecondary}
                value={qty}
                onChangeText={setQty}
              />
            </View>
            <TouchableOpacity
              testID="shop-add"
              style={[styles.addBtn, saving && { opacity: 0.6 }]}
              onPress={add}
              disabled={saving}
            >
              <Ionicons name="add" size={18} color={colors.textInverse} />
              <Text style={styles.addText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>A comprar ({pending.length})</Text>
          {pending.length === 0 ? (
            <Text style={styles.empty}>Nada pendente. ✨</Text>
          ) : (
            pending.map((i) => {
              const c = CATS.find((x) => x.id === i.category);
              return (
                <View key={i.id} style={styles.itemCard}>
                  <TouchableOpacity
                    testID={`shop-toggle-${i.id}`}
                    onPress={() => toggle(i)}
                    style={styles.checkbox}
                  >
                    <Ionicons name="ellipse-outline" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <View style={[styles.catTag, { backgroundColor: (c?.color || colors.primary) + '22' }]}>
                    <Ionicons name={c?.icon || 'apps'} size={14} color={c?.color || colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemText}>{i.item}</Text>
                    <Text style={styles.itemQty}>Qtd: {i.quantity}</Text>
                  </View>
                  <TouchableOpacity onPress={() => remove(i)}>
                    <Ionicons name="trash-outline" size={20} color={colors.sos} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {done.length > 0 ? (
            <>
              <Text style={styles.subtitle}>Comprados ({done.length})</Text>
              {done.map((i) => (
                <View key={i.id} style={[styles.itemCard, { opacity: 0.6 }]}>
                  <TouchableOpacity onPress={() => toggle(i)} style={styles.checkbox}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </TouchableOpacity>
                  <Text style={[styles.itemText, { textDecorationLine: 'line-through', flex: 1 }]}>
                    {i.item}
                  </Text>
                  <TouchableOpacity onPress={() => remove(i)}>
                    <Ionicons name="trash-outline" size={20} color={colors.sos} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : null}
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
  catRow: { flexDirection: 'row', gap: 6 },
  catBtn: { flex: 1, alignItems: 'center', padding: 8, borderRadius: radii.sm, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.bg, gap: 2 },
  catLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: { backgroundColor: colors.bg, padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, fontSize: fontSizes.base, color: colors.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 12, borderRadius: radii.md, gap: 6 },
  addText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: '700' },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, padding: spacing.sm },
  itemCard: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.sm },
  checkbox: { width: 32, alignItems: 'center' },
  catTag: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: fontSizes.base, color: colors.textPrimary, fontWeight: '600' },
  itemQty: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
});
