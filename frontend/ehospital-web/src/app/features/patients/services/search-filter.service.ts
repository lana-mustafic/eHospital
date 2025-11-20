import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SavedSearchFilter, PatientSearchFilter } from '../models/search-filter.model';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  private readonly STORAGE_KEY = 'ehospital_saved_filters';
  private savedFiltersSubject = new BehaviorSubject<SavedSearchFilter[]>([]);
  public savedFilters$: Observable<SavedSearchFilter[]> = this.savedFiltersSubject.asObservable();

  constructor() {
    this.loadSavedFilters();
  }

  saveFilter(name: string, filter: PatientSearchFilter): SavedSearchFilter {
    const savedFilter: SavedSearchFilter = {
      id: this.generateId(),
      name,
      filter,
      createdAt: new Date().toISOString(),
      isDefault: false
    };

    const filters = this.getSavedFilters();
    filters.push(savedFilter);
    this.saveToStorage(filters);
    this.savedFiltersSubject.next(filters);
    
    return savedFilter;
  }

  getSavedFilters(): SavedSearchFilter[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  loadSavedFilters(): void {
    const filters = this.getSavedFilters();
    this.savedFiltersSubject.next(filters);
  }

  deleteFilter(id: string): void {
    const filters = this.getSavedFilters().filter(f => f.id !== id);
    this.saveToStorage(filters);
    this.savedFiltersSubject.next(filters);
  }

  setDefaultFilter(id: string): void {
    const filters = this.getSavedFilters();
    filters.forEach(f => f.isDefault = f.id === id);
    this.saveToStorage(filters);
    this.savedFiltersSubject.next(filters);
  }

  private saveToStorage(filters: SavedSearchFilter[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }

  private generateId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

