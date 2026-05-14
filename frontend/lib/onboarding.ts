// Helper para controle do onboarding (1ª vez do usuário)
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@aura:onboarding-seen-v1';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {
    // noop
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // noop
  }
}
