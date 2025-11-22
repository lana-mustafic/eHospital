import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
}

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private settings$ = new BehaviorSubject<AccessibilitySettings>(this.getDefaultSettings());
  private announcement$ = new BehaviorSubject<string>('');

  constructor() {
    // Load saved settings
    this.loadSettings();
    // Detect system preferences
    this.detectSystemPreferences();
  }

  getSettings(): Observable<AccessibilitySettings> {
    return this.settings$.asObservable();
  }

  getCurrentSettings(): AccessibilitySettings {
    return this.settings$.value;
  }

  getAnnouncements(): Observable<string> {
    return this.announcement$.asObservable();
  }

  private getDefaultSettings(): AccessibilitySettings {
    return {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      screenReaderAnnouncements: true
    };
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings$.next({ ...this.getDefaultSettings(), ...parsed });
      } catch (e) {
        console.error('Error loading accessibility settings:', e);
      }
    }
  }

  private saveSettings(settings: AccessibilitySettings): void {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    this.settings$.next(settings);
    this.applySettings(settings);
  }

  private detectSystemPreferences(): void {
    // Detect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const current = this.settings$.value;
      this.saveSettings({ ...current, reducedMotion: true });
    }

    // Detect prefers-contrast
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      const current = this.settings$.value;
      this.saveSettings({ ...current, highContrast: true });
    }
  }

  setHighContrast(enabled: boolean): void {
    const current = this.settings$.value;
    this.saveSettings({ ...current, highContrast: enabled });
  }

  setFontSize(size: 'small' | 'medium' | 'large' | 'xlarge'): void {
    const current = this.settings$.value;
    this.saveSettings({ ...current, fontSize: size });
  }

  setReducedMotion(enabled: boolean): void {
    const current = this.settings$.value;
    this.saveSettings({ ...current, reducedMotion: enabled });
  }

  setScreenReaderAnnouncements(enabled: boolean): void {
    const current = this.settings$.value;
    this.saveSettings({ ...current, screenReaderAnnouncements: enabled });
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (this.settings$.value.screenReaderAnnouncements) {
      this.announcement$.next(message);
      // Clear after a short delay
      setTimeout(() => this.announcement$.next(''), 1000);
    }
  }

  private applySettings(settings: AccessibilitySettings): void {
    const root = document.documentElement;
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    root.classList.add(`font-${settings.fontSize}`);

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }

  // Keyboard navigation helpers
  trapFocus(element: HTMLElement): void {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        // Allow escape to close modals
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        element.dispatchEvent(escapeEvent);
      }
    });
  }

  // Skip link functionality
  createSkipLink(targetId: string, label: string): HTMLElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link';
    skipLink.setAttribute('aria-label', label);
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return skipLink;
  }
}

