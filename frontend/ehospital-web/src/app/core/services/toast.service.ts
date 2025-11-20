import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'critical';
  duration?: number;
  title?: string;
  playSound?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();
  private toastIdCounter = 0;
  private soundEnabled = true;

  private playAlertSound(): void {
    if (!this.soundEnabled) return;
    
    try {
      // Create a simple alert sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  }

  private show(message: string, type: Toast['type'], duration = 3000, title?: string, playSound = false): void {
    const toast: Toast = {
      id: this.toastIdCounter++,
      message,
      type,
      duration,
      title,
      playSound
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Play sound for critical alerts
    if (playSound && (type === 'critical' || type === 'error')) {
      this.playAlertSound();
    }

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(message: string, duration?: number, title?: string): void {
    this.show(message, 'success', duration, title);
  }

  error(message: string, duration?: number, title?: string): void {
    this.show(message, 'error', duration || 5000, title);
  }

  info(message: string, duration?: number, title?: string): void {
    this.show(message, 'info', duration, title);
  }

  warning(message: string, duration?: number, title?: string): void {
    this.show(message, 'warning', duration || 5000, title);
  }

  critical(message: string, title = 'Critical Alert', duration?: number): void {
    this.show(message, 'critical', duration || 10000, title, true);
  }

  remove(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

