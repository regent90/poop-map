// 音效管理工具
export class SoundEffectManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // 檢查瀏覽器支援
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (e) {
        console.warn('AudioContext not supported:', e);
      }
    }
  }

  // 啟用/禁用音效
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // 播放爆炸音效
  playExplosion() {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 爆炸音效參數
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (e) {
      console.warn('Failed to play explosion sound:', e);
    }
  }

  // 播放魔法音效
  playMagic() {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 魔法音效參數
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.6);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.6);
    } catch (e) {
      console.warn('Failed to play magic sound:', e);
    }
  }

  // 播放彩虹音效
  playRainbow() {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C大調音階
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext!.createOscillator();
          const gainNode = this.audioContext!.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext!.destination);
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
          gainNode.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
          
          oscillator.start(this.audioContext!.currentTime);
          oscillator.stop(this.audioContext!.currentTime + 0.2);
        }, index * 100);
      });
    } catch (e) {
      console.warn('Failed to play rainbow sound:', e);
    }
  }

  // 播放震動音效
  playRumble() {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 低頻震動音效
      oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 1);
      
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 1);
    } catch (e) {
      console.warn('Failed to play rumble sound:', e);
    }
  }

  // 根據道具類型播放對應音效
  playAttackSound(itemType: string) {
    switch (itemType) {
      case 'golden_poop':
        this.playMagic();
        break;
      case 'rainbow_poop':
        this.playRainbow();
        break;
      case 'stinky_poop':
        this.playRumble();
        setTimeout(() => this.playExplosion(), 500);
        break;
      default:
        this.playExplosion();
        break;
    }
  }
}

// 全局音效管理器實例
export const soundManager = new SoundEffectManager();