import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [];
  currentLanguage: string = 'en';
  isOpen = false;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.languages = this.translationService.languages;
    this.translationService.getCurrentLanguage().subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  selectLanguage(langCode: string): void {
    this.translationService.setLanguage(langCode);
    this.isOpen = false;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  getCurrentLanguage(): Language {
    return this.languages.find(l => l.code === this.currentLanguage) || this.languages[0];
  }
}

