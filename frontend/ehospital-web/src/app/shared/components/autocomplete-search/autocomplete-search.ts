import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export interface AutocompleteOption {
  id: number | string;
  label: string;
  subtitle?: string;
  data?: any;
}

@Component({
  selector: 'app-autocomplete-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autocomplete-search.html',
  styleUrls: ['./autocomplete-search.scss']
})
export class AutocompleteSearchComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() options: AutocompleteOption[] = [];
  @Input() minLength = 2;
  @Input() debounceTime = 300;
  @Input() maxResults = 10;
  @Output() search = new EventEmitter<string>();
  @Output() select = new EventEmitter<AutocompleteOption>();
  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;

  searchTerm = '';
  filteredOptions: AutocompleteOption[] = [];
  showDropdown = false;
  selectedIndex = -1;
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onInputChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  performSearch(term: string): void {
    if (term.length < this.minLength) {
      this.filteredOptions = [];
      this.showDropdown = false;
      return;
    }

    this.search.emit(term);
    
    const lowerTerm = term.toLowerCase();
    this.filteredOptions = this.options
      .filter(option => 
        option.label.toLowerCase().includes(lowerTerm) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(lowerTerm))
      )
      .slice(0, this.maxResults);
    
    this.showDropdown = this.filteredOptions.length > 0;
    this.selectedIndex = -1;
  }

  selectOption(option: AutocompleteOption): void {
    this.searchTerm = option.label;
    this.showDropdown = false;
    this.select.emit(option);
    this.filteredOptions = [];
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown || this.filteredOptions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredOptions.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = this.selectedIndex <= 0 
          ? this.filteredOptions.length - 1 
          : this.selectedIndex - 1;
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length) {
          this.selectOption(this.filteredOptions[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        this.selectedIndex = -1;
        break;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredOptions = [];
    this.showDropdown = false;
    this.search.emit('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.inputElement && !this.inputElement.nativeElement.contains(event.target as Node)) {
      this.showDropdown = false;
    }
  }
}

