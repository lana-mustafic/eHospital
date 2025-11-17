import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prescription, PrescriptionService } from './services/prescription.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './prescriptions.html',
  styleUrls: ['./prescriptions.scss']
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  filteredPrescriptions: Prescription[] = [];
  paginatedPrescriptions: Prescription[] = [];
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
    private prescriptionService: PrescriptionService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      medicationName: ['', Validators.required],
      dosage: ['', Validators.required],
      instructions: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.prescriptionService.getAll().subscribe({
      next: (data) => {
        this.prescriptions = data;
        this.filteredPrescriptions = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load prescriptions');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }
    const payload = this.form.value as Partial<Prescription>;
    if (this.isEdit && this.editingId) {
      this.prescriptionService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Prescription updated successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update prescription');
        }
      });
    } else {
      this.prescriptionService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Prescription created successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create prescription');
        }
      });
    }
  }

  edit(p: Prescription) {
    this.isEdit = true;
    this.editingId = p.id;
    this.form.patchValue({
      patientId: p.patientId,
      medicationName: p.medicationName,
      dosage: p.dosage,
      instructions: p.instructions || ''
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
      this.filteredPrescriptions = this.prescriptions;
    } else {
      this.filteredPrescriptions = this.prescriptions.filter(prescription =>
        (prescription.patientName?.toLowerCase().includes(term)) ||
        (prescription.doctorName?.toLowerCase().includes(term)) ||
        (prescription.medicationName?.toLowerCase().includes(term)) ||
        (prescription.dosage?.toLowerCase().includes(term)) ||
        (prescription.instructions?.toLowerCase().includes(term)) ||
        (prescription.patientId?.toString().includes(term))
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredPrescriptions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPrescriptions = this.filteredPrescriptions.slice(startIndex, endIndex);
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
    this.prescriptionService.getAll().subscribe({
      next: d => {
        this.prescriptions = d;
        this.filteredPrescriptions = d;
        this.updatePagination();
      },
      error: () => this.toastService.error('Failed to reload prescriptions')
    });
  }
}

