import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from './services/patient.service';
import { CreatePatientRequest, Patient, UpdatePatientRequest } from './models/patient.model';
import { PatientSearchFilter } from './models/search-filter.model';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';
import { PatientHistoryTimelineComponent } from './components/patient-history-timeline/patient-history-timeline.component';
import { AutocompleteSearchComponent, AutocompleteOption } from '../../shared/components/autocomplete-search/autocomplete-search';
import { AdvancedFiltersComponent } from './components/advanced-filters/advanced-filters';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, TableSkeletonComponent, PatientHistoryTimelineComponent, AutocompleteSearchComponent, AdvancedFiltersComponent],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  paginatedPatients: Patient[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  showHistoryModal = false;
  showAdvancedFilters = false;
  isEditMode = false;
  selectedPatient: Patient | null = null;
  selectedPatientForHistory: Patient | null = null;
  patientForm: FormGroup;
  currentFilter: PatientSearchFilter = {};
  autocompleteOptions: AutocompleteOption[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private patientService: PatientService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: [''],
      emergencyContact: [''],
      bloodType: ['']
    });
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
        this.updateAutocompleteOptions();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load patients');
      }
    });
  }

  updateAutocompleteOptions(): void {
    this.autocompleteOptions = this.patients.map(patient => ({
      id: patient.id,
      label: `${patient.firstName} ${patient.lastName}`,
      subtitle: `${patient.email} • ${patient.phoneNumber}`,
      data: patient
    }));
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentFilter.searchTerm = term || undefined;
    this.applyFilters();
  }

  onPatientSelect(option: AutocompleteOption): void {
    const patient = option.data as Patient;
    if (patient) {
      // Navigate to patient summary or filter to show only this patient
      this.searchTerm = option.label;
      this.currentFilter.searchTerm = `${patient.firstName} ${patient.lastName}`;
      this.applyFilters();
    }
  }

  onFilterChange(filter: PatientSearchFilter): void {
    this.currentFilter = { ...filter };
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.patients];

    // Apply search term filter
    if (this.currentFilter.searchTerm) {
      const term = this.currentFilter.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(patient =>
        patient.firstName.toLowerCase().includes(term) ||
        patient.lastName.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        patient.phoneNumber.includes(term)
      );
    }

    // Apply gender filter
    if (this.currentFilter.gender) {
      filtered = filtered.filter(p => p.gender === this.currentFilter.gender);
    }

    // Apply blood type filter
    if (this.currentFilter.bloodType) {
      filtered = filtered.filter(p => p.bloodType === this.currentFilter.bloodType);
    }

    // Apply date of birth range filter
    if (this.currentFilter.dateOfBirthFrom) {
      const fromDate = new Date(this.currentFilter.dateOfBirthFrom);
      filtered = filtered.filter(p => new Date(p.dateOfBirth) >= fromDate);
    }
    if (this.currentFilter.dateOfBirthTo) {
      const toDate = new Date(this.currentFilter.dateOfBirthTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.dateOfBirth) <= toDate);
    }

    // Apply age range filter
    if (this.currentFilter.ageFrom !== undefined) {
      filtered = filtered.filter(p => this.getAge(p.dateOfBirth) >= this.currentFilter.ageFrom!);
    }
    if (this.currentFilter.ageTo !== undefined) {
      filtered = filtered.filter(p => this.getAge(p.dateOfBirth) <= this.currentFilter.ageTo!);
    }

    // Apply emergency contact filter
    if (this.currentFilter.hasEmergencyContact) {
      filtered = filtered.filter(p => p.emergencyContact && p.emergencyContact.trim().length > 0);
    }

    // Apply blood type presence filter
    if (this.currentFilter.hasBloodType) {
      filtered = filtered.filter(p => p.bloodType && p.bloodType.trim().length > 0);
    }

    this.filteredPatients = filtered;
    this.currentPage = 1; // Reset to first page on filter
    this.updatePagination();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  closeAdvancedFilters(): void {
    this.showAdvancedFilters = false;
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPatients = this.filteredPatients.slice(startIndex, endIndex);
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  openPatientRegistrationWizard() {
    this.router.navigate(['/wizards/patient-registration']);
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedPatient = null;
    this.patientForm.reset();
    this.setPasswordValidators(true);
    this.showModal = true;
  }

  openEditModal(patient: Patient) {
    this.isEditMode = true;
    this.selectedPatient = patient;
    this.patientForm.patchValue({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      bloodType: patient.bloodType
    });
    this.patientForm.get('password')?.reset();
    this.setPasswordValidators(false);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.patientForm.reset();
    this.selectedPatient = null;
  }

  savePatient() {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched(this.patientForm);
      return;
    }

    const formData = this.patientForm.value;

    if (this.isEditMode && this.selectedPatient?.id) {
      const payload: UpdatePatientRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodType: formData.bloodType
      };

      this.patientService.update(this.selectedPatient.id, payload).subscribe({
        next: () => {
          this.toastService.success('Patient updated successfully');
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.toastService.error(error.error?.message || 'Failed to update patient');
        }
      });
    } else {
      const payload: CreatePatientRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodType: formData.bloodType
      };

      this.patientService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Patient created successfully');
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.toastService.error(error.error?.message || 'Failed to create patient');
        }
      });
    }
  }

  deletePatient(patient: Patient) {
    if (!patient.id) return;
    
    if (confirm(`Are you sure you want to delete patient "${patient.firstName} ${patient.lastName}"?`)) {
      this.patientService.delete(patient.id).subscribe({
        next: () => {
          this.toastService.success('Patient deleted successfully');
          this.loadPatients();
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.toastService.error(error.error?.message || 'Failed to delete patient');
        }
      });
    }
  }
  
  openHistoryModal(patient: Patient) {
    this.selectedPatientForHistory = patient;
    this.showHistoryModal = true;
  }
  
  closeHistoryModal() {
    this.showHistoryModal = false;
    this.selectedPatientForHistory = null;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private setPasswordValidators(isRequired: boolean) {
    const passwordControl = this.patientForm.get('password');
    if (!passwordControl) {
      return;
    }

    if (isRequired) {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      passwordControl.clearValidators();
    }

    passwordControl.updateValueAndValidity();
  }

  get firstName() {
    return this.patientForm.get('firstName');
  }

  get lastName() {
    return this.patientForm.get('lastName');
  }

  get dateOfBirth() {
    return this.patientForm.get('dateOfBirth');
  }

  get gender() {
    return this.patientForm.get('gender');
  }

  get phoneNumber() {
    return this.patientForm.get('phoneNumber');
  }

  get email() {
    return this.patientForm.get('email');
  }

  get password() {
    return this.patientForm.get('password');
  }
  
  exportToCSV() {
    if (this.filteredPatients.length === 0) {
      this.toastService.warning('No patients to export');
      return;
    }
    
    const headers = ['Name', 'Gender', 'Age', 'Date of Birth', 'Email', 'Phone', 'Blood Type', 'Emergency Contact', 'Address'];
    const data = this.filteredPatients.map(patient => ({
      'Name': `${patient.firstName} ${patient.lastName}`,
      'Gender': patient.gender,
      'Age': `${this.getAge(patient.dateOfBirth)} years`,
      'Date of Birth': this.formatDate(patient.dateOfBirth),
      'Email': patient.email,
      'Phone': patient.phoneNumber,
      'Blood Type': patient.bloodType || '—',
      'Emergency Contact': patient.emergencyContact || '—',
      'Address': patient.address || '—'
    }));
    
    this.exportService.exportToCSV(data, 'patients', headers);
    this.toastService.success('Patients exported to CSV successfully');
  }
  
  exportToPDF() {
    if (this.filteredPatients.length === 0) {
      this.toastService.warning('No patients to export');
      return;
    }
    
    const headers = ['Name', 'Gender', 'Age', 'Email', 'Phone', 'Blood Type'];
    const data = this.filteredPatients.map(patient => ({
      'Name': `${patient.firstName} ${patient.lastName}`,
      'Gender': patient.gender,
      'Age': `${this.getAge(patient.dateOfBirth)} years`,
      'Email': patient.email,
      'Phone': patient.phoneNumber,
      'Blood Type': patient.bloodType || '—'
    }));
    
    this.exportService.exportToPDF(data, 'patients', headers, 'Patients Report');
    this.toastService.success('Patients exported to PDF successfully');
  }
}
