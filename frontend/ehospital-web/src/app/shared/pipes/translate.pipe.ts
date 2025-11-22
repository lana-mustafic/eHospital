import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string = '';
  private lastValue: string = '';
  private subscription?: Subscription;

  constructor(
    private translationService: TranslationService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.subscription = this.translationService.getCurrentLanguage().subscribe((lang) => {
      // Reset cache when language changes
      this.lastKey = '';
      this.lastValue = '';
      // Force change detection
      this.changeDetector.markForCheck();
    });
  }

  transform(key: string, params?: { [key: string]: any }): string {
    if (!key) {
      return '';
    }

    // Always get fresh translation (don't cache since language can change)
    const currentLang = this.translationService.getCurrentLanguageCode();
    const cacheKey = `${currentLang}:${key}:${params ? JSON.stringify(params) : ''}`;
    
    if (cacheKey === this.lastKey) {
      return this.lastValue;
    }

    this.lastKey = cacheKey;
    this.lastValue = this.translationService.translate(key, params);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

