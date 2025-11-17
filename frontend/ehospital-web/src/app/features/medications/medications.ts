import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicationService, Medication } from './services/medication.service';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './medications.html',
  styleUrls: ['./medications.scss']
})
export class Medications implements OnInit {
  medications: Medication[] = [];
  filteredMedications: Medication[] = [];
  paginatedMedications: Medication[] = [];
  isLoading = false;
  searchTerm = '';
  formFilter = '';
  statusFilter = '';
  showModal = false;
  isEditMode = false;
  selectedMedication: Medication | null = null;
  medicationForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Form options
  medicationForms = ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Cream', 'Drops', 'Inhaler', 'Other'];

  constructor(
    private medicationService: MedicationService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.medicationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      dosage: ['', [Validators.required]],
      form: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    this.isLoading = true;
    this.medicationService.getAll().subscribe({
      next: (data) => {
        this.medications = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading medications:', error);
        this.toastService.error('Failed to load medications');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.medications];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(search) ||
        med.description.toLowerCase().includes(search) ||
        med.dosage.toLowerCase().includes(search) ||
        med.form.toLowerCase().includes(search)
      );
    }

    // Form filter
    if (this.formFilter) {
      filtered = filtered.filter(med => med.form === this.formFilter);
    }

    // Status filter
    if (this.statusFilter) {
      if (this.statusFilter === 'active') {
        filtered = filtered.filter(med => med.isActive);
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter(med => !med.isActive);
      } else if (this.statusFilter === 'low-stock') {
        filtered = filtered.filter(med => med.stockQuantity < 10 && med.isActive);
      }
    }

    this.filteredMedications = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMedications.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedMedications = this.filteredMedications.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedMedication = null;
    this.medicationForm.reset({
      name: '',
      description: '',
      dosage: '',
      form: '',
      price: 0,
      stockQuantity: 0
    });
    this.showModal = true;
  }

  openEditModal(medication: Medication): void {
    this.isEditMode = true;
    this.selectedMedication = medication;
    this.medicationForm.patchValue({
      name: medication.name,
      description: medication.description,
      dosage: medication.dosage,
      form: medication.form,
      price: medication.price,
      stockQuantity: medication.stockQuantity
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedMedication = null;
    this.medicationForm.reset();
  }

  saveMedication(): void {
    if (this.medicationForm.invalid) {
      this.markFormGroupTouched(this.medicationForm);
      return;
    }

    const formValue = this.medicationForm.value;

    if (this.isEditMode && this.selectedMedication) {
      // Update
      this.medicationService.update(this.selectedMedication.id, formValue).subscribe({
        next: () => {
          this.toastService.success('Medication updated successfully');
          this.closeModal();
          this.loadMedications();
        },
        error: (error) => {
          console.error('Error updating medication:', error);
          this.toastService.error('Failed to update medication');
        }
      });
    } else {
      // Create
      this.medicationService.create(formValue).subscribe({
        next: () => {
          this.toastService.success('Medication created successfully');
          this.closeModal();
          this.loadMedications();
        },
        error: (error) => {
          console.error('Error creating medication:', error);
          this.toastService.error('Failed to create medication');
        }
      });
    }
  }

  deleteMedication(medication: Medication): void {
    if (confirm(`Are you sure you want to delete ${medication.name}?`)) {
      this.medicationService.delete(medication.id).subscribe({
        next: () => {
          this.toastService.success('Medication deleted successfully');
          this.loadMedications();
        },
        error: (error) => {
          console.error('Error deleting medication:', error);
          this.toastService.error('Failed to delete medication');
        }
      });
    }
  }

  toggleActiveStatus(medication: Medication): void {
    this.medicationService.update(medication.id, { isActive: !medication.isActive }).subscribe({
      next: () => {
        this.toastService.success(`Medication ${!medication.isActive ? 'activated' : 'deactivated'} successfully`);
        this.loadMedications();
      },
      error: (error) => {
        console.error('Error updating medication status:', error);
        this.toastService.error('Failed to update medication status');
      }
    });
  }

  getStockStatusClass(quantity: number, isActive: boolean): string {
    if (!isActive) return 'status-inactive';
    if (quantity === 0) return 'status-out-of-stock';
    if (quantity < 10) return 'status-low-stock';
    return 'status-in-stock';
  }

  getStockStatusText(quantity: number, isActive: boolean): string {
    if (!isActive) return 'Inactive';
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  }

  getFieldError(fieldName: string): string {
    const field = this.medicationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'name': 'Name',
      'description': 'Description',
      'dosage': 'Dosage',
      'form': 'Form',
      'price': 'Price',
      'stockQuantity': 'Stock quantity'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  exportToCSV(): void {
    if (this.filteredMedications.length === 0) {
      this.toastService.warning('No medications to export');
      return;
    }

    const headers = ['Name', 'Form', 'Dosage', 'Price', 'Stock Quantity', 'Total Value', 'Status', 'Prescription Count'];
    const data = this.filteredMedications.map(med => ({
      'Name': med.name,
      'Form': med.form,
      'Dosage': med.dosage,
      'Price': med.price,
      'Stock Quantity': med.stockQuantity,
      'Total Value': (med.price * med.stockQuantity).toFixed(2),
      'Status': med.isActive ? 'Active' : 'Inactive',
      'Prescription Count': med.prescriptionCount || 0
    }));

    this.exportService.exportToCSV(data, 'medications', headers);
    this.toastService.success('Medications exported to CSV successfully');
  }

  exportToPDF(): void {
    if (this.filteredMedications.length === 0) {
      this.toastService.warning('No medications to export');
      return;
    }

    const headers = ['Name', 'Form', 'Dosage', 'Price', 'Stock Quantity', 'Status'];
    const data = this.filteredMedications.map(med => ({
      'Name': med.name,
      'Form': med.form,
      'Dosage': med.dosage,
      'Price': med.price,
      'Stock Quantity': med.stockQuantity,
      'Status': med.isActive ? 'Active' : 'Inactive'
    }));

    this.exportService.exportToPDF(data, 'medications', headers, 'Medications Report');
    this.toastService.success('Medications exported to PDF successfully');
  }
}
