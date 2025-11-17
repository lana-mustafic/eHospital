import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabTest, LabTestService, CreateLabTestRequest, UpdateLabTestRequest } from './services/lab-test.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';
import { PatientService } from '../patients/services/patient.service';
import { Patient } from '../patients/models/patient.model';
import { DoctorService } from '../doctors/services/doctor.service';
import { Doctor } from '../doctors/models/doctor.model';

@Component({
  selector: 'app-lab-tests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './lab-tests.html',
  styleUrls: ['./lab-tests.scss']
})
export class LabTestsComponent implements OnInit {
  labTests: LabTest[] = [];
  filteredLabTests: LabTest[] = [];
  paginatedLabTests: LabTest[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  isLoading = false;
  searchTerm = '';
  patientFilter: number | null = null;
  statusFilter: string = '';
  showModal = false;
  showFileUploadModal = false;
  selectedLabTestForFile: LabTest | null = null;
  selectedFile: File | null = null;
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  testTypes = ['Blood Test', 'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG', 'Urine Test', 'Stool Test', 'Other'];
  testStatuses = ['Ordered', 'In Progress', 'Completed', 'Cancelled'];

  constructor(
    private labTestService: LabTestService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      orderedDate: [new Date().toISOString().slice(0, 16), Validators.required],
      testName: ['', [Validators.required, Validators.minLength(2)]],
      testType: ['', Validators.required],
      testCode: [''],
      status: ['Ordered', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadLabTests();
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

  loadLabTests() {
    this.isLoading = true;
    this.labTestService.getAll().subscribe({
      next: (data) => {
        this.labTests = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load lab tests');
      }
    });
  }

  applyFilters() {
    let temp = this.labTests;

    // Patient filter
    if (this.patientFilter) {
      temp = temp.filter(lt => lt.patientId === this.patientFilter);
    }

    // Status filter
    if (this.statusFilter) {
      temp = temp.filter(lt => lt.status === this.statusFilter);
    }

    // Search
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(lt =>
        lt.testName?.toLowerCase().includes(term) ||
        lt.testType?.toLowerCase().includes(term) ||
        lt.testCode?.toLowerCase().includes(term) ||
        lt.patientName?.toLowerCase().includes(term) ||
        lt.doctorName?.toLowerCase().includes(term) ||
        lt.notes?.toLowerCase().includes(term)
      );
    }

    this.filteredLabTests = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLabTests.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLabTests = this.filteredLabTests.slice(startIndex, endIndex);
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
      orderedDate: new Date().toISOString().slice(0, 16),
      status: 'Ordered',
      patientId: this.patientFilter || '',
      doctorId: ''
    });
    this.showModal = true;
  }

  openEditModal(lt: LabTest) {
    this.isEdit = true;
    this.editingId = lt.id;
    const orderedDate = lt.orderedDate ? new Date(lt.orderedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
    const completedDate = lt.completedDate ? new Date(lt.completedDate).toISOString().slice(0, 16) : null;
    this.form.patchValue({
      patientId: lt.patientId,
      doctorId: lt.doctorId,
      orderedDate: orderedDate,
      testName: lt.testName,
      testType: lt.testType,
      testCode: lt.testCode || '',
      status: lt.status,
      results: lt.results || '',
      notes: lt.notes || ''
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form.reset();
  }

  openFileUploadModal(lt: LabTest) {
    this.selectedLabTestForFile = lt;
    this.selectedFile = null;
    this.showFileUploadModal = true;
  }

  closeFileUploadModal() {
    this.showFileUploadModal = false;
    this.selectedLabTestForFile = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile() {
    if (!this.selectedLabTestForFile || !this.selectedFile) {
      this.toastService.warning('Please select a file to upload');
      return;
    }

    this.labTestService.uploadFile(this.selectedLabTestForFile.id, this.selectedFile).subscribe({
      next: () => {
        this.toastService.success('File uploaded successfully');
        this.closeFileUploadModal();
        this.loadLabTests();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to upload file');
      }
    });
  }

  downloadFile(lt: LabTest) {
    if (!lt.hasFile) {
      this.toastService.warning('No file available for this lab test');
      return;
    }

    this.labTestService.downloadFile(lt.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = lt.fileName || `lab-test-${lt.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toastService.success('File downloaded successfully');
      },
      error: (err) => {
        this.toastService.error('Failed to download file');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.toastService.error('Please correct the form errors.');
      return;
    }

    const formValue = this.form.value;
    
    if (this.isEdit && this.editingId) {
      const payload: UpdateLabTestRequest = {
        testName: formValue.testName,
        testType: formValue.testType,
        testCode: formValue.testCode || undefined,
        status: formValue.status,
        results: formValue.results || undefined,
        notes: formValue.notes || undefined
      };
      
      this.labTestService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Lab test updated successfully');
          this.closeModal();
          this.loadLabTests();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update lab test');
        }
      });
    } else {
      const payload: CreateLabTestRequest = {
        patientId: formValue.patientId,
        doctorId: formValue.doctorId,
        orderedDate: new Date(formValue.orderedDate).toISOString(),
        testName: formValue.testName,
        testType: formValue.testType,
        testCode: formValue.testCode || undefined,
        status: formValue.status,
        notes: formValue.notes || undefined
      };
      
      this.labTestService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Lab test ordered successfully');
          this.closeModal();
          this.loadLabTests();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create lab test');
        }
      });
    }
  }

  updateStatus(lt: LabTest, newStatus: string) {
    const payload: UpdateLabTestRequest = {
      status: newStatus,
      completedDate: newStatus === 'Completed' ? new Date().toISOString() : undefined
    };
    
    this.labTestService.update(lt.id, payload).subscribe({
      next: () => {
        this.toastService.success(`Lab test status updated to ${newStatus}`);
        this.loadLabTests();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update status');
      }
    });
  }

  deleteLabTest(lt: LabTest) {
    if (!confirm(`Are you sure you want to delete lab test "${lt.testName}" for ${lt.patientName || 'patient'}?`)) {
      return;
    }
    this.labTestService.delete(lt.id).subscribe({
      next: () => {
        this.toastService.success('Lab test deleted successfully');
        this.loadLabTests();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete lab test');
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Ordered': 'status-ordered',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
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
    if (this.filteredLabTests.length === 0) {
      this.toastService.warning('No lab tests to export');
      return;
    }

    const headers = ['Patient', 'Doctor', 'Test Name', 'Test Type', 'Test Code', 'Status', 'Ordered Date', 'Completed Date', 'Has File'];
    const data = this.filteredLabTests.map(lt => ({
      'Patient': lt.patientName || `Patient #${lt.patientId}`,
      'Doctor': lt.doctorName || `Doctor #${lt.doctorId}`,
      'Test Name': lt.testName,
      'Test Type': lt.testType,
      'Test Code': lt.testCode || '—',
      'Status': lt.status,
      'Ordered Date': lt.orderedDate ? new Date(lt.orderedDate).toLocaleString() : '—',
      'Completed Date': lt.completedDate ? new Date(lt.completedDate).toLocaleString() : '—',
      'Has File': lt.hasFile ? 'Yes' : 'No'
    }));

    this.exportService.exportToCSV(data, 'lab-tests', headers);
    this.toastService.success('Lab tests exported to CSV successfully');
  }

  exportToPDF() {
    if (this.filteredLabTests.length === 0) {
      this.toastService.warning('No lab tests to export');
      return;
    }

    const headers = ['Patient', 'Test Name', 'Test Type', 'Status', 'Ordered Date', 'Completed Date'];
    const data = this.filteredLabTests.map(lt => ({
      'Patient': lt.patientName || `Patient #${lt.patientId}`,
      'Test Name': lt.testName,
      'Test Type': lt.testType,
      'Status': lt.status,
      'Ordered Date': lt.orderedDate ? new Date(lt.orderedDate).toLocaleDateString() : '—',
      'Completed Date': lt.completedDate ? new Date(lt.completedDate).toLocaleDateString() : '—'
    }));

    this.exportService.exportToPDF(data, 'lab-tests', headers, 'Lab Tests Report');
    this.toastService.success('Lab tests exported to PDF successfully');
  }
}

