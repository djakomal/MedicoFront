import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from './translation-service.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Important pour que le pipe se mette à jour lors du changement de langue
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private langChangeSubscription: Subscription;
  private lastKey: string = '';
  private lastValue: string = '';

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    // S'abonner aux changements de langue
    this.langChangeSubscription = this.translationService.currentLang$.subscribe(() => {
      this.lastKey = '';
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: { [key: string]: string }): string {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastValue = this.translationService.translate(key, params);
    }
    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}