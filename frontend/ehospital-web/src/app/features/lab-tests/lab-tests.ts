import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabTest, LabTestService, CreateLabTestRequest, UpdateLabTestRequest, LabResultValue } from './services/lab-test.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';
import { PatientService } from '../patients/services/patient.service';
import { Patient } from '../patients/models/patient.model';
import { DoctorService } from '../doctors/services/doctor.service';
import { Doctor } from '../doctors/models/doctor.model';
import { MedicalRecordService, MedicalRecord } from '../medical-records/services/medical-record.service';
import { AuthService } from '../../core/services/auth';

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
  priorities = ['Routine', 'Urgent', 'STAT'];
  specimenTypes = ['Blood', 'Urine', 'Stool', 'Sputum', 'Tissue', 'Swab', 'Other'];
  
  // Multi-step workflow
  currentStep = 1;
  totalSteps = 3;
  showOrderingWizard = false;
  
  // Specimen tracking
  showSpecimenModal = false;
  selectedLabTestForSpecimen: LabTest | null = null;
  specimenForm: FormGroup;
  
  // Result entry
  showResultModal = false;
  selectedLabTestForResult: LabTest | null = null;
  resultForm: FormGroup;
  
  // Medical records
  medicalRecords: MedicalRecord[] = [];
  
  // Critical alerts
  criticalResults: LabTest[] = [];
  showCriticalAlerts = false;

  constructor(
    private labTestService: LabTestService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private medicalRecordService: MedicalRecordService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      medicalRecordId: [''],
      orderedDate: [new Date().toISOString().slice(0, 16), Validators.required],
      testName: ['', [Validators.required, Validators.minLength(2)]],
      testType: ['', Validators.required],
      testCode: [''],
      priority: ['Routine', Validators.required],
      specimenType: [''],
      status: ['Ordered', Validators.required],
      notes: ['']
    });
    
    this.specimenForm = this.fb.group({
      specimenType: ['', Validators.required],
      collectedDate: [new Date().toISOString().slice(0, 16), Validators.required],
      collectedBy: ['', Validators.required]
    });
    
    this.resultForm = this.fb.group({
      resultValues: this.fb.array([]),
      notes: [''],
      isCritical: [false]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadLabTests();
    this.loadCriticalResults();
    
    // Watch for patient changes to load medical records
    this.form.get('patientId')?.valueChanges.subscribe(patientId => {
      if (patientId) {
        this.loadMedicalRecords(patientId);
      } else {
        this.medicalRecords = [];
      }
    });
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
        // Generate barcodes for tests that don't have them
        this.labTests.forEach(lt => {
          if (!lt.barcode) {
            lt.barcode = LabTestService.generateBarcodeString(lt.id, lt.patientId);
          }
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load lab tests');
      }
    });
  }
  
  loadMedicalRecords(patientId: number) {
    this.medicalRecordService.getAll().subscribe({
      next: (data) => {
        this.medicalRecords = data.filter(mr => mr.patientId === patientId);
      },
      error: () => {
        this.medicalRecords = [];
      }
    });
  }
  
  loadCriticalResults() {
    this.labTestService.getCriticalResults().subscribe({
      next: (data) => {
        this.criticalResults = data;
        if (data.length > 0) {
          this.showCriticalAlerts = true;
          this.toastService.warning(`You have ${data.length} critical lab result(s) requiring attention!`);
        }
      },
      error: () => {
        // Silently fail - critical results endpoint may not exist yet
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

  // Multi-step ordering workflow
  openOrderingWizard() {
    this.currentStep = 1;
    this.showOrderingWizard = true;
    this.form.reset({
      orderedDate: new Date().toISOString().slice(0, 16),
      status: 'Ordered',
      priority: 'Routine',
      patientId: this.patientFilter || ''
    });
  }

  closeOrderingWizard() {
    this.showOrderingWizard = false;
    this.currentStep = 1;
    this.form.reset();
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validate current step
      if (this.currentStep === 1) {
        const step1Fields = ['patientId', 'doctorId', 'medicalRecordId'];
        const step1Valid = step1Fields.every(field => {
          const control = this.form.get(field);
          return field === 'medicalRecordId' || (control && control.valid);
        });
        if (!step1Valid) {
          this.markFormGroupTouched(this.form);
          this.toastService.error('Please complete all required fields');
          return;
        }
      } else if (this.currentStep === 2) {
        const step2Fields = ['testName', 'testType', 'priority'];
        const step2Valid = step2Fields.every(field => {
          const control = this.form.get(field);
          return control && control.valid;
        });
        if (!step2Valid) {
          this.markFormGroupTouched(this.form);
          this.toastService.error('Please complete all required fields');
          return;
        }
      }
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  finishOrdering() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.toastService.error('Please complete all required fields');
      return;
    }

    const formValue = this.form.value;
    const payload: CreateLabTestRequest = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId,
      medicalRecordId: formValue.medicalRecordId || undefined,
      orderedDate: new Date(formValue.orderedDate).toISOString(),
      testName: formValue.testName,
      testType: formValue.testType,
      testCode: formValue.testCode || undefined,
      priority: formValue.priority,
      specimenType: formValue.specimenType || undefined,
      status: 'Ordered',
      notes: formValue.notes || undefined
    };

    this.labTestService.create(payload).subscribe({
      next: (labTest) => {
        this.toastService.success('Lab test ordered successfully');
        this.closeOrderingWizard();
        this.loadLabTests();
        // Generate barcode
        if (labTest.id) {
          this.generateBarcodeForTest(labTest.id);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to create lab test');
      }
    });
  }

  // Specimen tracking
  openSpecimenModal(lt: LabTest) {
    this.selectedLabTestForSpecimen = lt;
    this.specimenForm.patchValue({
      specimenType: lt.specimenType || '',
      collectedDate: lt.specimenCollectedDate ? new Date(lt.specimenCollectedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      collectedBy: lt.specimenCollectedBy || ''
    });
    this.showSpecimenModal = true;
  }

  closeSpecimenModal() {
    this.showSpecimenModal = false;
    this.selectedLabTestForSpecimen = null;
    this.specimenForm.reset();
  }

  submitSpecimenInfo() {
    if (this.specimenForm.invalid || !this.selectedLabTestForSpecimen) {
      this.markFormGroupTouched(this.specimenForm);
      this.toastService.error('Please complete all required fields');
      return;
    }

    const formValue = this.specimenForm.value;
    const barcode = LabTestService.generateBarcodeString(
      this.selectedLabTestForSpecimen.id,
      this.selectedLabTestForSpecimen.patientId
    );

    this.labTestService.updateSpecimenInfo(this.selectedLabTestForSpecimen.id, {
      specimenType: formValue.specimenType,
      collectedDate: new Date(formValue.collectedDate).toISOString(),
      collectedBy: formValue.collectedBy,
      barcode: barcode
    }).subscribe({
      next: () => {
        this.toastService.success('Specimen information updated successfully');
        this.closeSpecimenModal();
        this.loadLabTests();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update specimen information');
      }
    });
  }

  generateBarcodeForTest(labTestId: number) {
    this.labTestService.generateBarcode(labTestId).subscribe({
      next: () => {
        this.loadLabTests();
      },
      error: () => {
        // Silently fail - barcode generation may not be implemented on backend yet
      }
    });
  }

  printBarcode(lt: LabTest) {
    if (!lt.barcode) {
      this.toastService.warning('No barcode available for this test');
      return;
    }
    // In a real implementation, this would open a print dialog with barcode
    window.print();
  }

  // Result entry
  openResultModal(lt: LabTest) {
    this.selectedLabTestForResult = lt;
    const resultArray = this.resultForm.get('resultValues') as FormArray;
    resultArray.clear();

    if (lt.resultValues && lt.resultValues.length > 0) {
      lt.resultValues.forEach(rv => {
        resultArray.push(this.createResultValueFormGroup(rv));
      });
    } else {
      // Add default result fields based on test type
      this.addDefaultResultFields(lt.testType);
    }

    this.resultForm.patchValue({
      notes: lt.notes || '',
      isCritical: lt.isCritical || false
    });
    this.showResultModal = true;
  }

  closeResultModal() {
    this.showResultModal = false;
    this.selectedLabTestForResult = null;
    const resultArray = this.resultForm.get('resultValues') as FormArray;
    resultArray.clear();
    this.resultForm.reset();
  }

  createResultValueFormGroup(rv?: LabResultValue): FormGroup {
    return this.fb.group({
      parameter: [rv?.parameter || '', Validators.required],
      value: [rv?.value || '', Validators.required],
      unit: [rv?.unit || ''],
      normalRange: [rv?.normalRange || ''],
      flag: [rv?.flag || 'Normal']
    });
  }

  addResultValue() {
    const resultArray = this.resultForm.get('resultValues') as FormArray;
    resultArray.push(this.createResultValueFormGroup());
  }

  removeResultValue(index: number) {
    const resultArray = this.resultForm.get('resultValues') as FormArray;
    resultArray.removeAt(index);
  }

  get resultValuesArray(): FormArray {
    return this.resultForm.get('resultValues') as FormArray;
  }

  addDefaultResultFields(testType: string) {
    const resultArray = this.resultForm.get('resultValues') as FormArray;
    
    // Common test parameters based on test type
    const defaultFields: { [key: string]: LabResultValue[] } = {
      'Blood Test': [
        { parameter: 'Hemoglobin', value: '', unit: 'g/dL', normalRange: '12.0-17.5', flag: 'Normal' },
        { parameter: 'White Blood Cell Count', value: '', unit: 'cells/μL', normalRange: '4,000-11,000', flag: 'Normal' },
        { parameter: 'Platelet Count', value: '', unit: 'cells/μL', normalRange: '150,000-450,000', flag: 'Normal' }
      ],
      'Urine Test': [
        { parameter: 'pH', value: '', unit: '', normalRange: '4.5-8.0', flag: 'Normal' },
        { parameter: 'Specific Gravity', value: '', unit: '', normalRange: '1.005-1.030', flag: 'Normal' },
        { parameter: 'Protein', value: '', unit: 'mg/dL', normalRange: 'Negative', flag: 'Normal' }
      ]
    };

    const fields = defaultFields[testType] || [{ parameter: 'Result', value: '', unit: '', normalRange: '', flag: 'Normal' }];
    fields.forEach(field => {
      resultArray.push(this.createResultValueFormGroup(field));
    });
  }

  calculateFlag(value: string, normalRange: string, index: number): void {
    const resultArray = this.resultForm.get('resultValues') as FormArray;
    const control = resultArray.at(index);
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || !normalRange) {
      control?.patchValue({ flag: 'Normal' });
      return;
    }

    const range = normalRange.split('-');
    if (range.length === 2) {
      const min = parseFloat(range[0].replace(/,/g, ''));
      const max = parseFloat(range[1].replace(/,/g, ''));
      if (numValue < min) {
        control?.patchValue({ flag: 'Low' });
      } else if (numValue > max) {
        control?.patchValue({ flag: numValue > max * 1.5 ? 'Critical' : 'High' });
      } else {
        control?.patchValue({ flag: 'Normal' });
      }
    }
  }

  submitResults() {
    if (this.resultForm.invalid || !this.selectedLabTestForResult) {
      this.markFormGroupTouched(this.resultForm);
      this.toastService.error('Please complete all required fields');
      return;
    }

    const formValue = this.resultForm.value;
    const resultValues: LabResultValue[] = formValue.resultValues.map((rv: any) => ({
      parameter: rv.parameter,
      value: rv.value,
      unit: rv.unit || undefined,
      normalRange: rv.normalRange || undefined,
      flag: rv.flag || 'Normal'
    }));

    const hasCritical = resultValues.some(rv => rv.flag === 'Critical') || formValue.isCritical;

    this.labTestService.submitResults(this.selectedLabTestForResult.id, {
      resultValues: resultValues,
      notes: formValue.notes || undefined,
      isCritical: hasCritical
    }).subscribe({
      next: () => {
        this.toastService.success('Lab results submitted successfully');
        if (hasCritical) {
          this.toastService.warning('Critical results detected! Notifications have been sent.');
        }
        this.closeResultModal();
        this.loadLabTests();
        this.loadCriticalResults();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to submit results');
      }
    });
  }

  reviewResults(lt: LabTest) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not found');
      return;
    }

    // Use the update method to mark as reviewed
    const payload: UpdateLabTestRequest = {
      reviewedBy: currentUser.name,
      reviewedDate: new Date().toISOString()
    };

    this.labTestService.update(lt.id, payload).subscribe({
      next: () => {
        this.toastService.success('Results marked as reviewed');
        this.loadLabTests();
      },
      error: (err) => {
        console.error('Review error:', err);
        // If the backend doesn't support reviewedBy/reviewedDate, try a simpler update
        if (err.status === 400 || err.status === 500) {
          // Fallback: just update notes to indicate review
          const fallbackPayload: UpdateLabTestRequest = {
            notes: (lt.notes || '') + `\n[Reviewed by ${currentUser.name} on ${new Date().toLocaleString()}]`
          };
          this.labTestService.update(lt.id, fallbackPayload).subscribe({
            next: () => {
              this.toastService.success('Results marked as reviewed');
              this.loadLabTests();
            },
            error: (fallbackErr) => {
              this.toastService.error(fallbackErr.error?.message || 'Failed to review results');
            }
          });
        } else {
          this.toastService.error(err.error?.message || 'Failed to review results');
        }
      }
    });
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
  }

  getPriorityClass(priority?: string): string {
    const classes: { [key: string]: string } = {
      'Routine': 'priority-routine',
      'Urgent': 'priority-urgent',
      'STAT': 'priority-stat'
    };
    return classes[priority || 'Routine'] || 'priority-routine';
  }

  getFlagClass(flag?: string): string {
    const classes: { [key: string]: string } = {
      'Normal': 'flag-normal',
      'High': 'flag-high',
      'Low': 'flag-low',
      'Critical': 'flag-critical'
    };
    return classes[flag || 'Normal'] || 'flag-normal';
  }

  dismissCriticalAlerts() {
    this.showCriticalAlerts = false;
  }
}

