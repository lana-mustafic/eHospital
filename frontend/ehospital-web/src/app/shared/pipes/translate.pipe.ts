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
    this.subscription = this.translationService.getCurrentLanguage().subscribe(() => {
      this.lastKey = '';
      this.changeDetector.markForCheck();
    });
  }

  transform(key: string, params?: { [key: string]: any }): string {
    if (!key) {
      return '';
    }

    if (key === this.lastKey && !params) {
      return this.lastValue;
    }

    this.lastKey = key;
    this.lastValue = this.translationService.translate(key, params);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

