// Background Music Manager - Música relaxante de fundo (OPCIONAL)
import { Audio } from 'expo-av';
import { storage } from './storage';

class BackgroundMusicManager {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private enabled: boolean = false; // Default OFF até ter arquivo de música
  private hasMusic: boolean = false;

  async init() {
    try {
      // Configurar modo de áudio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false, // Não continua em background por enquanto
        shouldDuckAndroid: true,
      });

      // Verificar preferência salva
      const saved = await storage.getItem('music_enabled');
      this.enabled = saved === 'true';

      console.log('[MUSIC] Inicializado. Enabled:', this.enabled);
    } catch (error) {
      console.error('[MUSIC] Erro ao inicializar:', error);
    }
  }

  async play() {
    // Por enquanto não faz nada até adicionar arquivo de música
    console.log('[MUSIC] Play chamado, mas música não implementada ainda');
    return;
  }

  async pause() {
    console.log('[MUSIC] Pause chamado');
    return;
  }

  async stop() {
    console.log('[MUSIC] Stop chamado');
    return;
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    await storage.setItem('music_enabled', enabled ? 'true' : 'false');
    console.log('[MUSIC] Música', enabled ? 'ativada' : 'desativada');
    
    if (enabled) {
      console.log('[MUSIC] Adicione um arquivo MP3 em /assets/sounds/calm-music.mp3 para ativar a música');
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
      } catch (e) {
        console.error('[MUSIC] Erro ao limpar:', e);
      }
    }
  }
}

export const bgMusic = new BackgroundMusicManager();
