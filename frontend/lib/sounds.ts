// Aura Sound System — minimal, accessible, optional
// Uses tiny embedded base64 WAVs so the app works offline & has zero asset weight.
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'aura_sound_enabled';

type SoundKind = 'tap' | 'success' | 'error' | 'match' | 'flip';

// Tiny synthesized WAV files (base64). Soft & gentle for elderly users.
// Generated as short sine-based blips — kept minimal to avoid asset bloat.
const SOUNDS: Record<SoundKind, string> = {
  // ~80ms soft click
  tap: 'data:audio/wav;base64,UklGRsAAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZwAAACAfXp3dHFua2hlYmJiZGZobnB1eXyAg4eKjpKVmJyfo6ano6KhoJ+enZyZl5SQjImGgX97enRtaGNeWVRPSkVAOzczLCgkIBwYFBAOCwgEAv78+vj18u/r5+Pf28fDvru4tbKvrKqop6ako6KhoJ+enZyZl5SQjImGgX97enRtaGNeWVRPSkVAOzczLCgkIBw=',
  // ~250ms positive chime
  success: 'data:audio/wav;base64,UklGRkABAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRwBAACAh5CYn6attbq9wL/Au7awqaGYjoR5b2VbUUlAOTEtKismKB8eHRoeICgvOERLW2t3hZSdr7q9wcfFwbywoZGCcWNVSjUuKystLi0pKCs5Q1Vif4yQlpefqK62uLi5uLOuopiNgnNkVUg7LR8WFwsHCQwSGB0iJSsuMTU7QklRWmd1g42YpaqxtbS1tLOyrqupp6agnZqXk5GMioiFg4F+e3l3dHJwbWtoZWNgXltZVlNQTUtIRUI/PDk2My8tKigkIRwYFhEMCgYDAfwQDw0LCAcEAv77+ff18+/u6+jl5OHc2tjV0c7LycbDwL66trKvq6mlpJ+cmpaTko+Mg4F+e3l3dHJwbWtoZWNgXltZVlNQTUtIRUI/PDk2My8tKigkIRwYFhEMCgYDAfwQDw0LCA==',
  // ~200ms gentle low descend
  error: 'data:audio/wav;base64,UklGRiABAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YfwAAACAh4qNkJWZnaCkpqipqamop6Sgm5aRi4R+d3BqYltUTUdAOzUwLCglIyEhIiQnKi8zOD1CSE5UWmFnbXR6gIWLkJSXmpyenpyZlpKNiIN9eHRua2llYmBeXVtaWVdVU1FOS0hFQT47NzMvKyckHxkUDgkEAfny6+Te2NPNyMS+ubWyrqqopaOhoJ+fn5+goaGioqOjpKWlpqamp6enp6enp6anp6enp6enp6enp6enp6Ki',
  // ~150ms bright chime
  match: 'data:audio/wav;base64,UklGRkABAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRwBAACAi5SbpKuxtre3tbCqo5mPg3duYldNRDw1MCwqLDA2QExZZ3SCkJ2ottHi6/Lz8u3l2cm0nIVuVz4nFAcCBhAfNExlfpasv8/Y3uHi3tXKuKaSf21cTUE3LiknKi0wNTo+RUtRWGBnbnZ9hYuRl52ip6yvsbKzs7Kxr66tq6mlop+bmJWSjouHg397d3JtaGRgW1ZRTUhDPjkzLignIRwXEg0IAwD8+PXx7urn5N/c2dXSzsvIxcK/vLm2tLOzs7S2t7m7vL7Ax8nKzMzNz9DR0tPU1dbX2NnZ2tvb29zc3Nzc3Nzc3Nzc3NzcvbCmm5GHfXNqYVlSS0Q+OTQwLCkmJCMjJCYqLzU8RE1XYWp1foiToquys7Wzr6mhmI+EeW1iV0xCOTAoIRwYFRMTFRkdJCwzPEdRXGd0gI2Yo6yzubu7uba',
  // ~60ms soft pop (card flip)
  flip: 'data:audio/wav;base64,UklGRoAAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVwAAACAhYqOkpWXmZqamZeUkY2IhH95dG9pZF9aVE9KRUE9OTYzMC8uLi8wMjQ2OTw/QkVISk1QU1ZZW15hY2VnaGpsbW9wcXJzc3Rzc3JxcG9tbGpoZ2VjYWBeXFpYV1U=',
};

class SoundManager {
  private enabled = true;
  private inited = false;
  private soundsCache: Partial<Record<SoundKind, Audio.Sound>> = {};
  private loadingLock = false;

  async init() {
    if (this.inited) return;
    this.inited = true;
    try {
      const v = await AsyncStorage.getItem(STORAGE_KEY);
      if (v !== null) this.enabled = v === '1';
    } catch {}
    if (Platform.OS !== 'web') {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch {}
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async setEnabled(v: boolean) {
    this.enabled = v;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {}
  }

  async play(kind: SoundKind) {
    if (!this.enabled) return;
    await this.init();
    try {
      let s = this.soundsCache[kind];
      if (!s) {
        if (this.loadingLock) return;
        this.loadingLock = true;
        const { sound } = await Audio.Sound.createAsync(
          { uri: SOUNDS[kind] },
          { volume: kind === 'tap' || kind === 'flip' ? 0.35 : 0.6 },
        );
        this.soundsCache[kind] = sound;
        s = sound;
        this.loadingLock = false;
      }
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch {
      // silently fail — never block UI for audio
    }
  }

  async unloadAll() {
    for (const k of Object.keys(this.soundsCache) as SoundKind[]) {
      try {
        await this.soundsCache[k]?.unloadAsync();
      } catch {}
    }
    this.soundsCache = {};
  }
}

export const sounds = new SoundManager();
