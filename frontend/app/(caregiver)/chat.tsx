import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
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

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'caregiver' | 'responsible';
  text: string;
  created_at: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { activePatient } = useActivePatient();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    if (!activePatient) return;
    try {
      const { data } = await api.get<Message[]>('/chat', { params: { patient_id: activePatient.id } });
      setMsgs(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch {
      // ignore
    }
  }, [activePatient]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      await api.post('/chat', { patient_id: activePatient!.id, text: t });
      setText('');
      await load();
    } catch (e) {
      Alert.alert('Erro', apiError(e));
    } finally {
      setSending(false);
    }
  };

  if (!activePatient) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: spacing.lg }}>
          <LinkPatientCard role={(user?.role as 'caregiver' | 'responsible') || 'caregiver'} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={64}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Conversa sobre {activePatient.full_name.split(' ')[0]}</Text>
          <PatientSwitcher />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {msgs.length === 0 ? (
            <Text style={styles.empty}>
              Comece a conversa aqui. Apenas cuidadores e responsáveis vinculados a este paciente podem ver.
            </Text>
          ) : (
            msgs.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <View
                  key={m.id}
                  style={[styles.bubbleWrap, { alignItems: mine ? 'flex-end' : 'flex-start' }]}
                >
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                    {!mine ? (
                      <Text style={styles.sender}>
                        {m.sender_name} • {m.sender_role === 'caregiver' ? 'Cuidador' : 'Responsável'}
                      </Text>
                    ) : null}
                    <Text style={[styles.msgText, mine && { color: colors.textInverse }]}>{m.text}</Text>
                    <Text style={[styles.time, mine && { color: '#FFFFFFAA' }]}>
                      {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            testID="chat-input"
            style={styles.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            testID="chat-send"
            style={[styles.sendBtn, (sending || !text.trim()) && { opacity: 0.5 }]}
            onPress={send}
            disabled={sending || !text.trim()}
          >
            <Ionicons name="send" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.sm },
  empty: { color: colors.textSecondary, fontSize: fontSizes.base, textAlign: 'center', padding: spacing.lg },
  bubbleWrap: { width: '100%' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radii.lg, gap: 4 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  sender: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '700' },
  msgText: { fontSize: fontSizes.base, color: colors.textPrimary },
  time: { fontSize: fontSizes.xs, color: colors.textSecondary, alignSelf: 'flex-end' },
  composer: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, backgroundColor: colors.bg, padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, fontSize: fontSizes.base, color: colors.textPrimary, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: colors.primary, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
