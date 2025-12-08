import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VitalSigns, VitalSignsService, CreateVitalSignsRequest, UpdateVitalSignsRequest } from './services/vital-signs.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';
import { PatientService } from '../patients/services/patient.service';
import { Patient } from '../patients/models/patient.model';

@Component({
  selector: 'app-vital-signs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './vital-signs.html',
  styleUrls: ['./vital-signs.scss']
})
export class VitalSignsComponent implements OnInit {
  vitalSigns: VitalSigns[] = [];
  filteredVitalSigns: VitalSigns[] = [];
  paginatedVitalSigns: VitalSigns[] = [];
  patients: Patient[] = [];
  isLoading = false;
  searchTerm = '';
  patientFilter: number | null = null;
  showModal = false;
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private vitalSignsService: VitalSignsService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      recordedDate: [new Date().toISOString().slice(0, 16), Validators.required],
      bloodPressureSystolic: [null],
      bloodPressureDiastolic: [null],
      temperature: [null],
      heartRate: [null],
      respiratoryRate: [null],
      weight: [null],
      height: [null],
      oxygenSaturation: [null],
      bloodGlucose: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadVitalSigns();
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

  loadVitalSigns() {
    this.isLoading = true;
    this.vitalSignsService.getAll().subscribe({
      next: (data) => {
        this.vitalSigns = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load vital signs');
      }
    });
  }

  applyFilters() {
    let temp = this.vitalSigns;

    // Patient filter
    if (this.patientFilter) {
      temp = temp.filter(vs => vs.patientId === this.patientFilter);
    }

    // Search
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(vs =>
        vs.patientName?.toLowerCase().includes(term) ||
        vs.notes?.toLowerCase().includes(term) ||
        vs.patientId?.toString().includes(term)
      );
    }

    this.filteredVitalSigns = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredVitalSigns.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVitalSigns = this.filteredVitalSigns.slice(startIndex, endIndex);
  }

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

  openAddModal() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset({
      recordedDate: new Date().toISOString().slice(0, 16),
      patientId: this.patientFilter || ''
    });
    this.showModal = true;
  }

  openEditModal(vs: VitalSigns) {
    this.isEdit = true;
    this.editingId = vs.id;
    const recordedDate = vs.recordedDate ? new Date(vs.recordedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
    this.form.patchValue({
      patientId: vs.patientId,
      recordedDate: recordedDate,
      bloodPressureSystolic: vs.bloodPressureSystolic,
      bloodPressureDiastolic: vs.bloodPressureDiastolic,
      temperature: vs.temperature,
      heartRate: vs.heartRate,
      respiratoryRate: vs.respiratoryRate,
      weight: vs.weight,
      height: vs.height,
      oxygenSaturation: vs.oxygenSaturation,
      bloodGlucose: vs.bloodGlucose,
      notes: vs.notes || ''
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form.reset();
  }

  submit() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.toastService.error('Please correct the form errors.');
      return;
    }

    const formValue = this.form.value;
    const payload: CreateVitalSignsRequest | UpdateVitalSignsRequest = {
      patientId: formValue.patientId,
      recordedDate: new Date(formValue.recordedDate).toISOString(),
      bloodPressureSystolic: formValue.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: formValue.bloodPressureDiastolic || undefined,
      temperature: formValue.temperature || undefined,
      heartRate: formValue.heartRate || undefined,
      respiratoryRate: formValue.respiratoryRate || undefined,
      weight: formValue.weight || undefined,
      height: formValue.height || undefined,
      oxygenSaturation: formValue.oxygenSaturation || undefined,
      bloodGlucose: formValue.bloodGlucose || undefined,
      notes: formValue.notes || undefined
    };

    if (this.isEdit && this.editingId) {
      this.vitalSignsService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Vital signs updated successfully');
          this.closeModal();
          this.loadVitalSigns();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update vital signs');
        }
      });
    } else {
      this.vitalSignsService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Vital signs recorded successfully');
          this.closeModal();
          this.loadVitalSigns();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to record vital signs');
        }
      });
    }
  }

  deleteVitalSigns(vs: VitalSigns) {
    if (!confirm(`Are you sure you want to delete vital signs record for ${vs.patientName || 'patient'}?`)) {
      return;
    }
    this.vitalSignsService.delete(vs.id).subscribe({
      next: () => {
        this.toastService.success('Vital signs deleted successfully');
        this.loadVitalSigns();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete vital signs');
      }
    });
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  exportToCSV() {
    if (this.filteredVitalSigns.length === 0) {
      this.toastService.warning('No vital signs to export');
      return;
    }

    const headers = ['Patient', 'Date', 'BP', 'Temp (°C)', 'HR (bpm)', 'RR', 'Weight (kg)', 'Height (cm)', 'SpO2 (%)', 'Glucose (mg/dL)', 'BMI', 'Notes'];
    const data = this.filteredVitalSigns.map(vs => ({
      'Patient': vs.patientName || `Patient #${vs.patientId}`,
      'Date': vs.recordedDate ? new Date(vs.recordedDate).toLocaleString() : '—',
      'BP': vs.bloodPressure || '—',
      'Temp (°C)': vs.temperature || '—',
      'HR (bpm)': vs.heartRate || '—',
      'RR': vs.respiratoryRate || '—',
      'Weight (kg)': vs.weight || '—',
      'Height (cm)': vs.height || '—',
      'SpO2 (%)': vs.oxygenSaturation || '—',
      'Glucose (mg/dL)': vs.bloodGlucose || '—',
      'BMI': vs.bmiIfAvailable || '—',
      'Notes': vs.notes || '—'
    }));

    this.exportService.exportToCSV(data, 'vital-signs', headers);
    this.toastService.success('Vital signs exported to CSV successfully');
  }

  exportToPDF() {
    if (this.filteredVitalSigns.length === 0) {
      this.toastService.warning('No vital signs to export');
      return;
    }

    const headers = ['Patient', 'Date', 'BP', 'Temp', 'HR', 'Weight', 'BMI', 'Notes'];
    const data = this.filteredVitalSigns.map(vs => ({
      'Patient': vs.patientName || `Patient #${vs.patientId}`,
      'Date': vs.recordedDate ? new Date(vs.recordedDate).toLocaleDateString() : '—',
      'BP': vs.bloodPressure || '—',
      'Temp': vs.temperature ? `${vs.temperature}°C` : '—',
      'HR': vs.heartRate ? `${vs.heartRate} bpm` : '—',
      'Weight': vs.weight ? `${vs.weight} kg` : '—',
      'BMI': vs.bmiIfAvailable || '—',
      'Notes': vs.notes || '—'
    }));

    this.exportService.exportToPDF(data, 'vital-signs', headers, 'Vital Signs Report');
    this.toastService.success('Vital signs exported to PDF successfully');
  }
}

