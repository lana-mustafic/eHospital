import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';
import { PatientService } from '../patients/services/patient.service';
import { Patient } from '../patients/models/patient.model';
import { DoctorService } from '../doctors/services/doctor.service';
import { Doctor } from '../doctors/models/doctor.model';
import {
  MedicalHistoryService,
  PatientAllergy,
  CreatePatientAllergyRequest,
  UpdatePatientAllergyRequest,
  ChronicCondition,
  CreateChronicConditionRequest,
  UpdateChronicConditionRequest,
  FamilyMedicalHistory,
  CreateFamilyMedicalHistoryRequest,
  UpdateFamilyMedicalHistoryRequest
} from './services/medical-history.service';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './medical-history.html',
  styleUrls: ['./medical-history.scss']
})
export class MedicalHistoryComponent implements OnInit {
  activeTab: 'allergies' | 'conditions' | 'family' = 'allergies';
  
  // Allergies
  allergies: PatientAllergy[] = [];
  filteredAllergies: PatientAllergy[] = [];
  paginatedAllergies: PatientAllergy[] = [];
  
  // Conditions
  conditions: ChronicCondition[] = [];
  filteredConditions: ChronicCondition[] = [];
  paginatedConditions: ChronicCondition[] = [];
  
  // Family History
  familyHistories: FamilyMedicalHistory[] = [];
  filteredFamilyHistories: FamilyMedicalHistory[] = [];
  paginatedFamilyHistories: FamilyMedicalHistory[] = [];
  
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  isLoading = false;
  searchTerm = '';
  patientFilter: number | null = null;
  showModal = false;
  
  // Forms
  allergyForm: FormGroup;
  conditionForm: FormGroup;
  familyForm: FormGroup;
  
  isEdit = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Options
  allergyTypes = ['Food', 'Medication', 'Environmental', 'Other'];
  severities = ['Mild', 'Moderate', 'Severe', 'Life-threatening'];
  relationships = ['Father', 'Mother', 'Sibling', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Other'];
  conditionCategories = ['Cardiovascular', 'Respiratory', 'Diabetes', 'Cancer', 'Mental Health', 'Neurological', 'Other'];
  conditionStatuses = ['Active', 'Controlled', 'In Remission', 'Resolved'];

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.allergyForm = this.fb.group({
      patientId: ['', Validators.required],
      allergenName: ['', Validators.required],
      allergyType: ['', Validators.required],
      severity: ['', Validators.required],
      reaction: [''],
      onsetDate: [''],
      notes: [''],
      isActive: [true]
    });

    this.conditionForm = this.fb.group({
      patientId: ['', Validators.required],
      conditionName: ['', Validators.required],
      category: [''],
      diagnosisDate: [''],
      status: [''],
      treatment: [''],
      notes: [''],
      isActive: [true],
      diagnosedByDoctorId: [null]
    });

    this.familyForm = this.fb.group({
      patientId: ['', Validators.required],
      relationship: ['', Validators.required],
      conditionName: ['', Validators.required],
      category: [''],
      ageOfOnset: [''],
      status: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadAllergies();
    this.loadConditions();
    this.loadFamilyHistories();
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: () => {
        this.toastService.error('Failed to load patients');
      }
    });
  }

  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: () => {
        this.toastService.error('Failed to load doctors');
      }
    });
  }

  // Allergies
  loadAllergies() {
    this.isLoading = true;
    this.medicalHistoryService.getAllAllergies().subscribe({
      next: (data) => {
        this.allergies = data;
        this.applyAllergyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load allergies');
      }
    });
  }

  applyAllergyFilters() {
    let temp = this.allergies;
    if (this.patientFilter) {
      temp = temp.filter(a => a.patientId === this.patientFilter);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(a =>
        a.allergenName?.toLowerCase().includes(term) ||
        a.patientName?.toLowerCase().includes(term) ||
        a.allergyType?.toLowerCase().includes(term)
      );
    }
    this.filteredAllergies = temp;
    this.currentPage = 1;
    this.updateAllergyPagination();
  }

  updateAllergyPagination() {
    this.totalPages = Math.ceil(this.filteredAllergies.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAllergies = this.filteredAllergies.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Conditions
  loadConditions() {
    this.isLoading = true;
    this.medicalHistoryService.getAllConditions().subscribe({
      next: (data) => {
        this.conditions = data;
        this.applyConditionFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load chronic conditions');
      }
    });
  }

  applyConditionFilters() {
    let temp = this.conditions;
    if (this.patientFilter) {
      temp = temp.filter(c => c.patientId === this.patientFilter);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(c =>
        c.conditionName?.toLowerCase().includes(term) ||
        c.patientName?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term)
      );
    }
    this.filteredConditions = temp;
    this.currentPage = 1;
    this.updateConditionPagination();
  }

  updateConditionPagination() {
    this.totalPages = Math.ceil(this.filteredConditions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedConditions = this.filteredConditions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Family History
  loadFamilyHistories() {
    this.isLoading = true;
    this.medicalHistoryService.getAllFamilyHistories().subscribe({
      next: (data) => {
        this.familyHistories = data;
        this.applyFamilyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load family medical history');
      }
    });
  }

  applyFamilyFilters() {
    let temp = this.familyHistories;
    if (this.patientFilter) {
      temp = temp.filter(f => f.patientId === this.patientFilter);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(f =>
        f.conditionName?.toLowerCase().includes(term) ||
        f.patientName?.toLowerCase().includes(term) ||
        f.relationship?.toLowerCase().includes(term)
      );
    }
    this.filteredFamilyHistories = temp;
    this.currentPage = 1;
    this.updateFamilyPagination();
  }

  updateFamilyPagination() {
    this.totalPages = Math.ceil(this.filteredFamilyHistories.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedFamilyHistories = this.filteredFamilyHistories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Common pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  updatePagination() {
    if (this.activeTab === 'allergies') {
      this.updateAllergyPagination();
    } else if (this.activeTab === 'conditions') {
      this.updateConditionPagination();
    } else {
      this.updateFamilyPagination();
    }
  }

  // Tab switching
  switchTab(tab: 'allergies' | 'conditions' | 'family') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.updatePagination();
  }

  // Allergies CRUD
  openAddAllergyModal() {
    this.isEdit = false;
    this.editingId = null;
    this.allergyForm.reset({
      patientId: this.patientFilter || '',
      isActive: true
    });
    this.showModal = true;
  }

  openEditAllergyModal(allergy: PatientAllergy) {
    this.isEdit = true;
    this.editingId = allergy.id;
    this.allergyForm.patchValue({
      patientId: allergy.patientId,
      allergenName: allergy.allergenName,
      allergyType: allergy.allergyType,
      severity: allergy.severity,
      reaction: allergy.reaction || '',
      onsetDate: allergy.onsetDate ? allergy.onsetDate.slice(0, 16) : '',
      notes: allergy.notes || '',
      isActive: allergy.isActive
    });
    this.showModal = true;
  }

  saveAllergy() {
    if (this.allergyForm.invalid) return;
    const formValue = this.allergyForm.value;
    const payload: CreatePatientAllergyRequest = {
      ...formValue,
      onsetDate: formValue.onsetDate ? new Date(formValue.onsetDate).toISOString() : undefined
    };

    if (this.isEdit && this.editingId) {
      const updatePayload: UpdatePatientAllergyRequest = { ...payload };
      delete (updatePayload as any).patientId;
      this.medicalHistoryService.updateAllergy(this.editingId, updatePayload).subscribe({
        next: () => {
          this.toastService.success('Allergy updated successfully');
          this.loadAllergies();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to update allergy')
      });
    } else {
      this.medicalHistoryService.createAllergy(payload).subscribe({
        next: () => {
          this.toastService.success('Allergy added successfully');
          this.loadAllergies();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to add allergy')
      });
    }
  }

  deleteAllergy(id: number) {
    if (confirm('Are you sure you want to delete this allergy?')) {
      this.medicalHistoryService.deleteAllergy(id).subscribe({
        next: () => {
          this.toastService.success('Allergy deleted successfully');
          this.loadAllergies();
        },
        error: () => this.toastService.error('Failed to delete allergy')
      });
    }
  }

  // Conditions CRUD
  openAddConditionModal() {
    this.isEdit = false;
    this.editingId = null;
    this.conditionForm.reset({
      patientId: this.patientFilter || '',
      isActive: true
    });
    this.showModal = true;
  }

  openEditConditionModal(condition: ChronicCondition) {
    this.isEdit = true;
    this.editingId = condition.id;
    this.conditionForm.patchValue({
      patientId: condition.patientId,
      conditionName: condition.conditionName,
      category: condition.category || '',
      diagnosisDate: condition.diagnosisDate ? condition.diagnosisDate.slice(0, 16) : '',
      status: condition.status || '',
      treatment: condition.treatment || '',
      notes: condition.notes || '',
      isActive: condition.isActive,
      diagnosedByDoctorId: condition.diagnosedByDoctorId || null
    });
    this.showModal = true;
  }

  saveCondition() {
    if (this.conditionForm.invalid) return;
    const formValue = this.conditionForm.value;
    const payload: CreateChronicConditionRequest = {
      ...formValue,
      diagnosisDate: formValue.diagnosisDate ? new Date(formValue.diagnosisDate).toISOString() : undefined,
      diagnosedByDoctorId: formValue.diagnosedByDoctorId || undefined
    };

    if (this.isEdit && this.editingId) {
      const updatePayload: UpdateChronicConditionRequest = { ...payload };
      delete (updatePayload as any).patientId;
      this.medicalHistoryService.updateCondition(this.editingId, updatePayload).subscribe({
        next: () => {
          this.toastService.success('Chronic condition updated successfully');
          this.loadConditions();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to update chronic condition')
      });
    } else {
      this.medicalHistoryService.createCondition(payload).subscribe({
        next: () => {
          this.toastService.success('Chronic condition added successfully');
          this.loadConditions();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to add chronic condition')
      });
    }
  }

  deleteCondition(id: number) {
    if (confirm('Are you sure you want to delete this chronic condition?')) {
      this.medicalHistoryService.deleteCondition(id).subscribe({
        next: () => {
          this.toastService.success('Chronic condition deleted successfully');
          this.loadConditions();
        },
        error: () => this.toastService.error('Failed to delete chronic condition')
      });
    }
  }

  // Family History CRUD
  openAddFamilyModal() {
    this.isEdit = false;
    this.editingId = null;
    this.familyForm.reset({
      patientId: this.patientFilter || ''
    });
    this.showModal = true;
  }

  openEditFamilyModal(history: FamilyMedicalHistory) {
    this.isEdit = true;
    this.editingId = history.id;
    this.familyForm.patchValue({
      patientId: history.patientId,
      relationship: history.relationship,
      conditionName: history.conditionName,
      category: history.category || '',
      ageOfOnset: history.ageOfOnset || '',
      status: history.status || '',
      notes: history.notes || ''
    });
    this.showModal = true;
  }

  saveFamily() {
    if (this.familyForm.invalid) return;
    const payload: CreateFamilyMedicalHistoryRequest = this.familyForm.value;

    if (this.isEdit && this.editingId) {
      const updatePayload: UpdateFamilyMedicalHistoryRequest = { ...payload };
      delete (updatePayload as any).patientId;
      this.medicalHistoryService.updateFamilyHistory(this.editingId, updatePayload).subscribe({
        next: () => {
          this.toastService.success('Family medical history updated successfully');
          this.loadFamilyHistories();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to update family medical history')
      });
    } else {
      this.medicalHistoryService.createFamilyHistory(payload).subscribe({
        next: () => {
          this.toastService.success('Family medical history added successfully');
          this.loadFamilyHistories();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to add family medical history')
      });
    }
  }

  deleteFamily(id: number) {
    if (confirm('Are you sure you want to delete this family medical history?')) {
      this.medicalHistoryService.deleteFamilyHistory(id).subscribe({
        next: () => {
          this.toastService.success('Family medical history deleted successfully');
          this.loadFamilyHistories();
        },
        error: () => this.toastService.error('Failed to delete family medical history')
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.isEdit = false;
    this.editingId = null;
  }

  // Export
  exportData() {
    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    if (this.activeTab === 'allergies') {
      headers = ['Patient', 'Allergen', 'Type', 'Severity', 'Reaction', 'Onset Date', 'Status', 'Notes'];
      data = this.filteredAllergies.map(a => ({
        'Patient': a.patientName,
        'Allergen': a.allergenName,
        'Type': a.allergyType,
        'Severity': a.severity,
        'Reaction': a.reaction || '',
        'Onset Date': a.onsetDate || '',
        'Status': a.isActive ? 'Active' : 'Inactive',
        'Notes': a.notes || ''
      }));
      filename = 'patient_allergies';
    } else if (this.activeTab === 'conditions') {
      headers = ['Patient', 'Condition', 'Category', 'Diagnosis Date', 'Status', 'Treatment', 'Active', 'Notes'];
      data = this.filteredConditions.map(c => ({
        'Patient': c.patientName,
        'Condition': c.conditionName,
        'Category': c.category || '',
        'Diagnosis Date': c.diagnosisDate || '',
        'Status': c.status || '',
        'Treatment': c.treatment || '',
        'Active': c.isActive ? 'Yes' : 'No',
        'Notes': c.notes || ''
      }));
      filename = 'chronic_conditions';
    } else {
      headers = ['Patient', 'Relationship', 'Condition', 'Category', 'Age of Onset', 'Status', 'Notes'];
      data = this.filteredFamilyHistories.map(f => ({
        'Patient': f.patientName,
        'Relationship': f.relationship,
        'Condition': f.conditionName,
        'Category': f.category || '',
        'Age of Onset': f.ageOfOnset || '',
        'Status': f.status || '',
        'Notes': f.notes || ''
      }));
      filename = 'family_medical_history';
    }

    this.exportService.exportToCSV(data, filename, headers);
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  }

  getDoctorName(doctorId?: number): string {
    if (!doctorId) return '';
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
  }
}

