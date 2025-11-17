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
import { MedicalRecordService } from '../medical-records/services/medical-record.service';
import { AppointmentService } from '../appointments/services/appointment.service';
import {
  DischargeSummaryService,
  DischargeSummary,
  CreateDischargeSummaryRequest,
  UpdateDischargeSummaryRequest
} from './services/discharge-summary.service';

@Component({
  selector: 'app-discharge-summaries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './discharge-summaries.html',
  styleUrls: ['./discharge-summaries.scss']
})
export class DischargeSummariesComponent implements OnInit {
  summaries: DischargeSummary[] = [];
  filteredSummaries: DischargeSummary[] = [];
  paginatedSummaries: DischargeSummary[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  isLoading = false;
  searchTerm = '';
  patientFilter: number | null = null;
  statusFilter: string | null = null;
  showModal = false;
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Options
  dischargeTypes = ['Routine', 'Against Medical Advice', 'Transfer', 'Death'];
  conditionsOnDischarge = ['Improved', 'Stable', 'Critical', 'Unchanged', 'Worsened'];
  statuses = ['Draft', 'Finalized', 'Printed'];

  constructor(
    private dischargeSummaryService: DischargeSummaryService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private medicalRecordService: MedicalRecordService,
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      dischargingDoctorId: ['', Validators.required],
      dischargeDate: [new Date().toISOString().slice(0, 16), Validators.required],
      admissionDate: [''],
      dischargeType: ['', Validators.required],
      conditionOnDischarge: ['', Validators.required],
      chiefComplaint: [''],
      historyOfPresentIllness: [''],
      hospitalCourse: [''],
      proceduresPerformed: [''],
      dischargeDiagnosis: [''],
      postDischargeInstructions: [''],
      activityRestrictions: [''],
      dietInstructions: [''],
      medicationInstructions: [''],
      warningSigns: [''],
      followUpDate: [''],
      followUpDoctorId: [null],
      followUpInstructions: [''],
      additionalNotes: [''],
      medicalRecordId: [null],
      appointmentId: [null]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadSummaries();
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

  loadSummaries() {
    this.isLoading = true;
    this.dischargeSummaryService.getAll().subscribe({
      next: (data) => {
        this.summaries = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load discharge summaries');
      }
    });
  }

  applyFilters() {
    let temp = this.summaries;

    if (this.patientFilter) {
      temp = temp.filter(s => s.patientId === this.patientFilter);
    }

    if (this.statusFilter) {
      temp = temp.filter(s => s.status === this.statusFilter);
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(s =>
        s.dischargeNumber?.toLowerCase().includes(term) ||
        s.patientName?.toLowerCase().includes(term) ||
        s.dischargeDiagnosis?.toLowerCase().includes(term)
      );
    }

    this.filteredSummaries = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredSummaries.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedSummaries = this.filteredSummaries.slice(startIndex, startIndex + this.itemsPerPage);
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

  openAddModal() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset({
      dischargeDate: new Date().toISOString().slice(0, 16),
      patientId: this.patientFilter || ''
    });
    this.showModal = true;
  }

  openEditModal(summary: DischargeSummary) {
    if (summary.status === 'Finalized') {
      this.toastService.error('Cannot edit a finalized discharge summary');
      return;
    }

    this.isEdit = true;
    this.editingId = summary.id;
    this.form.patchValue({
      patientId: summary.patientId,
      dischargingDoctorId: summary.dischargingDoctorId,
      dischargeDate: summary.dischargeDate ? summary.dischargeDate.slice(0, 16) : '',
      admissionDate: summary.admissionDate ? summary.admissionDate.slice(0, 16) : '',
      dischargeType: summary.dischargeType,
      conditionOnDischarge: summary.conditionOnDischarge,
      chiefComplaint: summary.chiefComplaint || '',
      historyOfPresentIllness: summary.historyOfPresentIllness || '',
      hospitalCourse: summary.hospitalCourse || '',
      proceduresPerformed: summary.proceduresPerformed || '',
      dischargeDiagnosis: summary.dischargeDiagnosis || '',
      postDischargeInstructions: summary.postDischargeInstructions || '',
      activityRestrictions: summary.activityRestrictions || '',
      dietInstructions: summary.dietInstructions || '',
      medicationInstructions: summary.medicationInstructions || '',
      warningSigns: summary.warningSigns || '',
      followUpDate: summary.followUpDate ? summary.followUpDate.slice(0, 16) : '',
      followUpDoctorId: summary.followUpDoctorId || null,
      followUpInstructions: summary.followUpInstructions || '',
      additionalNotes: summary.additionalNotes || '',
      medicalRecordId: summary.medicalRecordId || null,
      appointmentId: summary.appointmentId || null
    });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const payload: CreateDischargeSummaryRequest = {
      ...formValue,
      dischargeDate: new Date(formValue.dischargeDate).toISOString(),
      admissionDate: formValue.admissionDate ? new Date(formValue.admissionDate).toISOString() : undefined,
      followUpDate: formValue.followUpDate ? new Date(formValue.followUpDate).toISOString() : undefined,
      prescriptionIds: [] // TODO: Add prescription selection in UI
    };

    if (this.isEdit && this.editingId) {
      const updatePayload: UpdateDischargeSummaryRequest = { ...payload };
      this.dischargeSummaryService.update(this.editingId, updatePayload).subscribe({
        next: () => {
          this.toastService.success('Discharge summary updated successfully');
          this.loadSummaries();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to update discharge summary')
      });
    } else {
      this.dischargeSummaryService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Discharge summary created successfully');
          this.loadSummaries();
          this.closeModal();
        },
        error: () => this.toastService.error('Failed to create discharge summary')
      });
    }
  }

  finalizeSummary(id: number) {
    if (confirm('Are you sure you want to finalize this discharge summary? It cannot be edited after finalization.')) {
      this.dischargeSummaryService.finalize(id).subscribe({
        next: () => {
          this.toastService.success('Discharge summary finalized successfully');
          this.loadSummaries();
        },
        error: () => this.toastService.error('Failed to finalize discharge summary')
      });
    }
  }

  deleteSummary(id: number) {
    if (confirm('Are you sure you want to delete this discharge summary?')) {
      this.dischargeSummaryService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Discharge summary deleted successfully');
          this.loadSummaries();
        },
        error: () => this.toastService.error('Failed to delete discharge summary')
      });
    }
  }

  downloadPdf(id: number) {
    this.dischargeSummaryService.generatePdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `discharge-summary-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastService.error('Failed to generate PDF')
    });
  }

  closeModal() {
    this.showModal = false;
    this.isEdit = false;
    this.editingId = null;
  }

  exportData() {
    const headers = ['Discharge Number', 'Patient', 'Discharge Date', 'Discharge Type', 'Condition', 'Status', 'Discharging Doctor'];
    const data = this.filteredSummaries.map(s => ({
      'Discharge Number': s.dischargeNumber,
      'Patient': s.patientName || '',
      'Discharge Date': s.dischargeDate ? new Date(s.dischargeDate).toLocaleDateString() : '',
      'Discharge Type': s.dischargeType,
      'Condition': s.conditionOnDischarge,
      'Status': s.status,
      'Discharging Doctor': s.dischargingDoctorName || ''
    }));

    this.exportService.exportToCSV(data, 'discharge_summaries', headers);
  }
}

