import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessibilityService } from '../../../core/services/accessibility.service';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-accessibility-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, AsyncPipe],
  templateUrl: './accessibility-settings.component.html',
  styleUrls: ['./accessibility-settings.component.scss']
})
export class AccessibilitySettingsComponent implements OnInit, OnDestroy {
  highContrast = false;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  reducedMotion = false;
  screenReaderAnnouncements = true;
  isOpen = false;
  
  private subscription?: Subscription;
  announcements$: any;

  constructor(public accessibilityService: AccessibilityService) {
    this.announcements$ = this.accessibilityService.getAnnouncements();
  }

  ngOnInit(): void {
    this.subscription = this.accessibilityService.getSettings().subscribe(settings => {
      this.highContrast = settings.highContrast;
      this.fontSize = settings.fontSize;
      this.reducedMotion = settings.reducedMotion;
      this.screenReaderAnnouncements = settings.screenReaderAnnouncements;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.accessibilityService.announce('Accessibility settings panel opened');
    }
  }

  onHighContrastChange(enabled: boolean): void {
    this.accessibilityService.setHighContrast(enabled);
    this.accessibilityService.announce(
      enabled ? 'High contrast mode enabled' : 'High contrast mode disabled'
    );
  }

  onFontSizeChange(size: 'small' | 'medium' | 'large' | 'xlarge'): void {
    this.accessibilityService.setFontSize(size);
    const sizeLabels: Record<string, string> = {
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      xlarge: 'Extra Large'
    };
    this.accessibilityService.announce(`Font size changed to ${sizeLabels[size]}`);
  }

  onReducedMotionChange(enabled: boolean): void {
    this.accessibilityService.setReducedMotion(enabled);
    this.accessibilityService.announce(
      enabled ? 'Reduced motion enabled' : 'Reduced motion disabled'
    );
  }

  onScreenReaderAnnouncementsChange(enabled: boolean): void {
    this.accessibilityService.setScreenReaderAnnouncements(enabled);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.isOpen = false;
      event.preventDefault();
    }
  }
}

