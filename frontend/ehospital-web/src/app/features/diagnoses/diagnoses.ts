import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Diagnosis, DiagnosisService } from './services/diagnosis.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-diagnoses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './diagnoses.html',
  styleUrls: ['./diagnoses.scss']
})
export class DiagnosesComponent implements OnInit {
  diagnoses: Diagnosis[] = [];
  filteredDiagnoses: Diagnosis[] = [];
  paginatedDiagnoses: Diagnosis[] = [];
  isLoading = false;
  searchTerm = '';
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private diagnosisService: DiagnosisService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      condition: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.diagnosisService.getAll().subscribe({
      next: (data) => {
        this.diagnoses = data;
        this.filteredDiagnoses = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load diagnoses');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }
    const payload = this.form.value as Partial<Diagnosis>;
    if (this.isEdit && this.editingId) {
      this.diagnosisService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Diagnosis updated successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update diagnosis');
        }
      });
    } else {
      this.diagnosisService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Diagnosis created successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create diagnosis');
        }
      });
    }
  }

  edit(d: Diagnosis) {
    this.isEdit = true;
    this.editingId = d.id;
    this.form.patchValue({
      patientId: d.patientId,
      condition: d.condition,
      notes: d.notes || ''
    });
  }

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset();
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredDiagnoses = this.diagnoses;
    } else {
      this.filteredDiagnoses = this.diagnoses.filter(diagnosis =>
        (diagnosis.patientName?.toLowerCase().includes(term)) ||
        (diagnosis.doctorName?.toLowerCase().includes(term)) ||
        (diagnosis.condition?.toLowerCase().includes(term)) ||
        (diagnosis.notes?.toLowerCase().includes(term)) ||
        (diagnosis.patientId?.toString().includes(term))
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDiagnoses.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedDiagnoses = this.filteredDiagnoses.slice(startIndex, endIndex);
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

  private reload() {
    this.resetForm();
    this.diagnosisService.getAll().subscribe({
      next: d => {
        this.diagnoses = d;
        this.filteredDiagnoses = d;
        this.updatePagination();
      },
      error: () => this.toastService.error('Failed to reload diagnoses')
    });
  }
  
  exportToCSV() {
    if (this.filteredDiagnoses.length === 0) {
      this.toastService.warning('No diagnoses to export');
      return;
    }
    
    const headers = ['Patient', 'Doctor', 'Condition', 'Severity', 'Notes', 'Created At'];
    const data = this.filteredDiagnoses.map(diagnosis => ({
      'Patient': diagnosis.patientName || '—',
      'Doctor': diagnosis.doctorName || '—',
      'Condition': diagnosis.condition || '—',
      'Severity': diagnosis.severity || '—',
      'Notes': diagnosis.notes || '—',
      'Created At': diagnosis.createdAt ? new Date(diagnosis.createdAt).toLocaleString() : '—'
    }));
    
    this.exportService.exportToCSV(data, 'diagnoses', headers);
    this.toastService.success('Diagnoses exported to CSV successfully');
  }
  
  exportToPDF() {
    if (this.filteredDiagnoses.length === 0) {
      this.toastService.warning('No diagnoses to export');
      return;
    }
    
    const headers = ['Patient', 'Doctor', 'Condition', 'Severity', 'Notes', 'Created At'];
    const data = this.filteredDiagnoses.map(diagnosis => ({
      'Patient': diagnosis.patientName || '—',
      'Doctor': diagnosis.doctorName || '—',
      'Condition': diagnosis.condition || '—',
      'Severity': diagnosis.severity || '—',
      'Notes': diagnosis.notes || '—',
      'Created At': diagnosis.createdAt ? new Date(diagnosis.createdAt).toLocaleString() : '—'
    }));
    
    this.exportService.exportToPDF(data, 'diagnoses', headers, 'Diagnoses Report');
    this.toastService.success('Diagnoses exported to PDF successfully');
  }
}

