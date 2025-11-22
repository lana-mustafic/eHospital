import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'localizedDate',
  pure: false,
  standalone: true
})
export class LocalizedDatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private currentLocale: string = 'en-US';
  private datePipe: DatePipe;

  constructor(
    private translationService: TranslationService,
    private changeDetector: ChangeDetectorRef,
    @Inject(LOCALE_ID) private defaultLocale: string
  ) {
    this.currentLocale = this.getLocaleFromLanguage(this.translationService.getCurrentLanguageCode());
    this.datePipe = new DatePipe(this.currentLocale);
    
    this.subscription = this.translationService.getCurrentLanguage().subscribe(lang => {
      this.currentLocale = this.getLocaleFromLanguage(lang);
      this.datePipe = new DatePipe(this.currentLocale);
      this.changeDetector.markForCheck();
    });
  }

  transform(value: Date | string | null | undefined, format: string = 'short'): string | null {
    if (!value) {
      return null;
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) {
      return null;
    }

    return this.datePipe.transform(date, format);
  }

  private getLocaleFromLanguage(lang: string): string {
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'ar': 'ar-SA',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'pt': 'pt-BR'
    };
    return localeMap[lang] || 'en-US';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

