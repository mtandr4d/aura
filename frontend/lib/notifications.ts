import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let configured = false;

export async function configureNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!configured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('medications', {
          name: 'Lembretes de medicamento',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E07A5F',
        });
      } catch {
        // ignore
      }
    }
    configured = true;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  if (existing === 'denied') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMedicationReminder(
  medicationName: string,
  dosage: string,
  scheduleTime: string, // "HH:MM"
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const ok = await configureNotifications();
  if (!ok) return null;
  const [h, m] = scheduleTime.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Hora do remédio: ${medicationName}`,
        body: dosage ? `Dose: ${dosage}` : 'Toque para confirmar',
        sound: 'default',
        data: { type: 'medication', medicationName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null | undefined): Promise<void> {
  if (!id || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}
