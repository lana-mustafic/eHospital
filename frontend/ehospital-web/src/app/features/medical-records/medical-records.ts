import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecord, MedicalRecordService } from './services/medical-record.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './medical-records.html',
  styleUrls: ['./medical-records.scss']
})
export class MedicalRecordsComponent implements OnInit {
  records: MedicalRecord[] = [];
  filteredRecords: MedicalRecord[] = [];
  paginatedRecords: MedicalRecord[] = [];
  isLoading = false;
  searchTerm = '';
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  showForm = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private recordService: MedicalRecordService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      diagnosis: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.recordService.getAll().subscribe({
      next: (data) => {
        this.records = data;
        this.filteredRecords = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load medical records');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }
    const payload = this.form.value as Partial<MedicalRecord>;
    if (this.isEdit && this.editingId) {
      this.recordService.update(this.editingId, payload).subscribe({
      next: () => {
        this.toastService.success('Medical record updated successfully');
        this.resetForm();
        this.reload();
      },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update medical record');
        }
      });
    } else {
      this.recordService.create(payload).subscribe({
      next: () => {
        this.toastService.success('Medical record created successfully');
        this.resetForm();
        this.reload();
      },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create medical record');
        }
      });
    }
  }

  edit(r: MedicalRecord) {
    this.isEdit = true;
    this.showForm = true;
    this.editingId = r.id;
    this.form.patchValue({
      patientId: r.patientId,
      diagnosis: r.diagnosis || '',
      notes: r.notes || ''
    });
    // Scroll to form
    setTimeout(() => {
      const formCard = document.querySelector('.form-card');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  onDelete(r: MedicalRecord) {
    if (!r.id) return;
    if (!confirm('Delete this medical record?')) return;
    this.recordService.delete(r.id).subscribe({
      next: () => {
        this.toastService.success('Medical record deleted successfully');
        this.reload();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete medical record');
      }
    });
  }

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.showForm = false;
    this.form.reset();
  }

  showCreateForm() {
    this.isEdit = false;
    this.editingId = null;
    this.showForm = true;
    this.form.reset();
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRecords = this.records;
    } else {
      this.filteredRecords = this.records.filter(record =>
        (record.patientName?.toLowerCase().includes(term)) ||
        (record.doctorName?.toLowerCase().includes(term)) ||
        (record.diagnosis?.toLowerCase().includes(term)) ||
        (record.notes?.toLowerCase().includes(term)) ||
        (record.patientId?.toString().includes(term))
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRecords = this.filteredRecords.slice(startIndex, endIndex);
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
    this.recordService.getAll().subscribe({
      next: d => {
        this.records = d;
        this.filteredRecords = d;
        this.updatePagination();
      },
      error: () => this.toastService.error('Failed to reload medical records')
    });
  }
  
  exportToCSV() {
    if (this.filteredRecords.length === 0) {
      this.toastService.warning('No medical records to export');
      return;
    }
    
    const headers = ['Patient', 'Doctor', 'Diagnosis', 'Notes', 'Created At'];
    const data = this.filteredRecords.map(record => ({
      'Patient': record.patientName || '—',
      'Doctor': record.doctorName || '—',
      'Diagnosis': record.diagnosis || '—',
      'Notes': record.notes || '—',
      'Created At': record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'
    }));
    
    this.exportService.exportToCSV(data, 'medical-records', headers);
    this.toastService.success('Medical records exported to CSV successfully');
  }
  
  exportToPDF() {
    if (this.filteredRecords.length === 0) {
      this.toastService.warning('No medical records to export');
      return;
    }
    
    const headers = ['Patient', 'Doctor', 'Diagnosis', 'Notes', 'Created At'];
    const data = this.filteredRecords.map(record => ({
      'Patient': record.patientName || '—',
      'Doctor': record.doctorName || '—',
      'Diagnosis': record.diagnosis || '—',
      'Notes': record.notes || '—',
      'Created At': record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'
    }));
    
    this.exportService.exportToPDF(data, 'medical-records', headers, 'Medical Records Report');
    this.toastService.success('Medical records exported to PDF successfully');
  }
}

