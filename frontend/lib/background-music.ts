// Background Music Manager - Música relaxante de fundo
import { Audio } from 'expo-av';
import { storage } from './storage';

class BackgroundMusicManager {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private enabled: boolean = false;
  private hasMusic: boolean = false;

  async init() {
    try {
      // Configurar modo de áudio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Verificar preferência salva
      const saved = await storage.getItem('music_enabled');
      this.enabled = saved === 'true';

      // Tentar carregar música
      if (this.enabled) {
        await this.load();
      }

      console.log('[MUSIC] Inicializado. Enabled:', this.enabled);
    } catch (error) {
      console.error('[MUSIC] Erro ao inicializar:', error);
    }
  }

  async load() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      console.log('[MUSIC] Carregando música AURA Drift...');
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/calm-music.mp3'),
        {
          isLooping: true,
          volume: 0.25, // Volume baixo e suave
          shouldPlay: false,
        }
      );

      this.sound = sound;
      this.hasMusic = true;
      console.log('[MUSIC] Música AURA Drift carregada com sucesso!');
    } catch (error) {
      console.error('[MUSIC] Erro ao carregar música:', error);
      this.hasMusic = false;
    }
  }

  async play() {
    try {
      if (!this.enabled || !this.sound) {
        if (!this.hasMusic && this.enabled) {
          await this.load();
        }
        if (!this.sound) return;
      }

      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log('[MUSIC] 🎵 AURA Drift tocando...');
      }
    } catch (error) {
      console.error('[MUSIC] Erro ao tocar música:', error);
    }
  }

  async pause() {
    try {
      if (!this.sound) return;

      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log('[MUSIC] Música pausada');
      }
    } catch (error) {
      console.error('[MUSIC] Erro ao pausar música:', error);
    }
  }

  async stop() {
    try {
      if (!this.sound) return;
      await this.sound.stopAsync();
      this.isPlaying = false;
      console.log('[MUSIC] Música parada');
    } catch (error) {
      console.error('[MUSIC] Erro ao parar música:', error);
    }
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    await storage.setItem('music_enabled', enabled ? 'true' : 'false');
    console.log('[MUSIC] Música', enabled ? 'ativada' : 'desativada');

    if (enabled) {
      if (!this.hasMusic) {
        await this.load();
      }
      await this.play();
    } else {
      await this.pause();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async cleanup() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.hasMusic = false;
      } catch (e) {
        console.error('[MUSIC] Erro ao limpar:', e);
      }
    }
  }
}

export const bgMusic = new BackgroundMusicManager();
