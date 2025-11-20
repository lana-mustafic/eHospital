import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PatientSearchFilter, QuickFilterType, SavedSearchFilter } from '../../models/search-filter.model';
import { SearchFilterService } from '../../services/search-filter.service';
import { DepartmentService } from '../../../departments/services/department.service';
import { Department } from '../../../departments/models/department.model';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './advanced-filters.html',
  styleUrls: ['./advanced-filters.scss']
})
export class AdvancedFiltersComponent implements OnInit {
  @Input() isOpen = false;
  @Output() filterChange = new EventEmitter<PatientSearchFilter>();
  @Output() close = new EventEmitter<void>();

  filterForm: FormGroup;
  departments: Department[] = [];
  savedFilters: SavedSearchFilter[] = [];
  showSaveFilterModal = false;
  saveFilterName = '';
  activeQuickFilter: QuickFilterType | null = null;

  genders = ['Male', 'Female', 'Other'];
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  quickFilters: { type: QuickFilterType; label: string }[] = [
    { type: 'today', label: 'Today' },
    { type: 'thisWeek', label: 'This Week' },
    { type: 'thisMonth', label: 'This Month' },
    { type: 'all', label: 'All' }
  ];

  constructor(
    private fb: FormBuilder,
    private searchFilterService: SearchFilterService,
    private departmentService: DepartmentService
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      gender: [''],
      bloodType: [''],
      dateOfBirthFrom: [''],
      dateOfBirthTo: [''],
      registrationDateFrom: [''],
      registrationDateTo: [''],
      department: [''],
      ageFrom: [''],
      ageTo: [''],
      hasEmergencyContact: [false],
      hasBloodType: [false]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadSavedFilters();
    
    // Watch for form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: () => {
        // Silently fail
      }
    });
  }

  loadSavedFilters(): void {
    this.searchFilterService.savedFilters$.subscribe(filters => {
      this.savedFilters = filters;
    });
  }

  applyQuickFilter(type: QuickFilterType): void {
    this.activeQuickFilter = type;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    switch (type) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'all':
        this.filterForm.patchValue({
          registrationDateFrom: '',
          registrationDateTo: ''
        }, { emitEvent: false });
        this.activeQuickFilter = null;
        this.applyFilters();
        return;
    }

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    this.filterForm.patchValue({
      registrationDateFrom: this.formatDateForInput(startDate),
      registrationDateTo: this.formatDateForInput(endDate)
    }, { emitEvent: false });

    this.applyFilters();
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    const filter: PatientSearchFilter = {
      searchTerm: formValue.searchTerm || undefined,
      gender: formValue.gender || undefined,
      bloodType: formValue.bloodType || undefined,
      dateOfBirthFrom: formValue.dateOfBirthFrom || undefined,
      dateOfBirthTo: formValue.dateOfBirthTo || undefined,
      registrationDateFrom: formValue.registrationDateFrom || undefined,
      registrationDateTo: formValue.registrationDateTo || undefined,
      department: formValue.department || undefined,
      ageFrom: formValue.ageFrom ? Number(formValue.ageFrom) : undefined,
      ageTo: formValue.ageTo ? Number(formValue.ageTo) : undefined,
      hasEmergencyContact: formValue.hasEmergencyContact || undefined,
      hasBloodType: formValue.hasBloodType || undefined
    };

    this.filterChange.emit(filter);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.activeQuickFilter = null;
    this.applyFilters();
  }

  loadSavedFilter(filter: SavedSearchFilter): void {
    this.filterForm.patchValue(filter.filter, { emitEvent: false });
    this.activeQuickFilter = null;
    this.applyFilters();
  }

  openSaveFilterModal(): void {
    this.showSaveFilterModal = true;
    this.saveFilterName = '';
  }

  closeSaveFilterModal(): void {
    this.showSaveFilterModal = false;
    this.saveFilterName = '';
  }

  saveCurrentFilter(): void {
    if (!this.saveFilterName.trim()) {
      return;
    }

    const filter: PatientSearchFilter = {
      searchTerm: this.filterForm.value.searchTerm || undefined,
      gender: this.filterForm.value.gender || undefined,
      bloodType: this.filterForm.value.bloodType || undefined,
      dateOfBirthFrom: this.filterForm.value.dateOfBirthFrom || undefined,
      dateOfBirthTo: this.filterForm.value.dateOfBirthTo || undefined,
      registrationDateFrom: this.filterForm.value.registrationDateFrom || undefined,
      registrationDateTo: this.filterForm.value.registrationDateTo || undefined,
      department: this.filterForm.value.department || undefined,
      ageFrom: this.filterForm.value.ageFrom ? Number(this.filterForm.value.ageFrom) : undefined,
      ageTo: this.filterForm.value.ageTo ? Number(this.filterForm.value.ageTo) : undefined,
      hasEmergencyContact: this.filterForm.value.hasEmergencyContact || undefined,
      hasBloodType: this.filterForm.value.hasBloodType || undefined
    };

    this.searchFilterService.saveFilter(this.saveFilterName.trim(), filter);
    this.closeSaveFilterModal();
  }

  deleteSavedFilter(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this saved filter?')) {
      this.searchFilterService.deleteFilter(id);
    }
  }

  closePanel(): void {
    this.close.emit();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

