import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadiologyService, ImagingStudy, CreateImagingStudyRequest, UpdateImagingStudyRequest, RadiologyReport, DICOMImage, CreateRadiologyReportRequest } from './services/radiology.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-radiology',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './radiology.html',
  styleUrls: ['./radiology.scss']
})
export class RadiologyComponent implements OnInit {
  studies: ImagingStudy[] = [];
  filteredStudies: ImagingStudy[] = [];
  paginatedStudies: ImagingStudy[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  medicalRecords: MedicalRecord[] = [];
  isLoading = false;
  searchTerm = '';
  patientFilter: number | null = null;
  statusFilter: string = '';
  studyTypeFilter: string = '';
  
  // Modals
  showModal = false;
  showOrderingWizard = false;
  showImageViewer = false;
  showReportModal = false;
  showImageUploadModal = false;
  
  // Selected items
  selectedStudy: ImagingStudy | null = null;
  selectedStudyForImages: ImagingStudy | null = null;
  selectedStudyForReport: ImagingStudy | null = null;
  selectedImages: DICOMImage[] = [];
  currentImageIndex = 0;
  selectedFiles: File[] = [];
  
  // Forms
  form: FormGroup;
  reportForm: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Study types and options
  studyTypes = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'Fluoroscopy', 'Nuclear Medicine', 'PET Scan', 'Other'];
  modalities = ['XR', 'CT', 'MR', 'US', 'MG', 'FL', 'NM', 'PT', 'OT'];
  bodyParts = ['Chest', 'Abdomen', 'Head', 'Neck', 'Spine', 'Pelvis', 'Extremities', 'Breast', 'Cardiac', 'Other'];
  statuses = ['Ordered', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];
  priorities = ['Routine', 'Urgent', 'STAT'];
  reportStatuses = ['Draft', 'Preliminary', 'Final', 'Amended'];
  
  // Multi-step workflow
  currentStep = 1;
  totalSteps = 3;
  
  // DICOM viewer state
  viewerMode: 'single' | 'compare' = 'single';
  imageUrl: string = '';

  constructor(
    private radiologyService: RadiologyService,
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
      orderingPhysicianId: ['', Validators.required],
      medicalRecordId: [''],
      studyDate: [new Date().toISOString().slice(0, 10), Validators.required],
      studyTime: [new Date().toTimeString().slice(0, 5)],
      studyType: ['', Validators.required],
      modality: ['', Validators.required],
      bodyPart: [''],
      description: ['', [Validators.required, Validators.minLength(3)]],
      priority: ['Routine', Validators.required],
      status: ['Ordered', Validators.required],
      notes: ['']
    });
    
    this.reportForm = this.fb.group({
      findings: ['', Validators.required],
      impression: ['', Validators.required],
      recommendations: [''],
      status: ['Draft', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadStudies();
    
    this.form.get('patientId')?.valueChanges.subscribe(patientId => {
      if (patientId) {
        this.loadMedicalRecords(patientId);
      } else {
        this.medicalRecords = [];
      }
    });
    
    // Auto-set modality based on study type
    this.form.get('studyType')?.valueChanges.subscribe(studyType => {
      const typeToModality: { [key: string]: string } = {
        'X-Ray': 'XR',
        'CT Scan': 'CT',
        'MRI': 'MR',
        'Ultrasound': 'US',
        'Mammography': 'MG',
        'Fluoroscopy': 'FL',
        'Nuclear Medicine': 'NM',
        'PET Scan': 'PT'
      };
      if (typeToModality[studyType]) {
        this.form.patchValue({ modality: typeToModality[studyType] });
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

  loadStudies() {
    this.isLoading = true;
    this.radiologyService.getAllStudies().subscribe({
      next: (data) => {
        this.studies = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        // Silently fail if endpoint doesn't exist yet
        this.studies = [];
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    let temp = this.studies;

    if (this.patientFilter) {
      temp = temp.filter(s => s.patientId === this.patientFilter);
    }

    if (this.statusFilter) {
      temp = temp.filter(s => s.status === this.statusFilter);
    }

    if (this.studyTypeFilter) {
      temp = temp.filter(s => s.studyType === this.studyTypeFilter);
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(s =>
        s.description?.toLowerCase().includes(term) ||
        s.studyType?.toLowerCase().includes(term) ||
        s.bodyPart?.toLowerCase().includes(term) ||
        s.accessionNumber?.toLowerCase().includes(term) ||
        s.patientName?.toLowerCase().includes(term) ||
        s.orderingPhysicianName?.toLowerCase().includes(term)
      );
    }

    this.filteredStudies = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredStudies.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudies = this.filteredStudies.slice(startIndex, endIndex);
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

  // Ordering workflow
  openOrderingWizard() {
    this.currentStep = 1;
    this.showOrderingWizard = true;
    this.form.reset({
      studyDate: new Date().toISOString().slice(0, 10),
      studyTime: new Date().toTimeString().slice(0, 5),
      priority: 'Routine',
      status: 'Ordered',
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
      if (this.currentStep === 1) {
        const step1Fields = ['patientId', 'orderingPhysicianId'];
        const step1Valid = step1Fields.every(field => {
          const control = this.form.get(field);
          return control && control.valid;
        });
        if (!step1Valid) {
          this.markFormGroupTouched(this.form);
          this.toastService.error('Please complete all required fields');
          return;
        }
      } else if (this.currentStep === 2) {
        const step2Fields = ['studyType', 'modality', 'description'];
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
    const studyDateTime = `${formValue.studyDate}T${formValue.studyTime || '00:00'}:00`;
    
    const payload: CreateImagingStudyRequest = {
      studyDate: studyDateTime,
      studyTime: formValue.studyTime || undefined,
      studyType: formValue.studyType,
      modality: formValue.modality,
      bodyPart: formValue.bodyPart || undefined,
      description: formValue.description,
      priority: formValue.priority,
      patientId: formValue.patientId,
      orderingPhysicianId: formValue.orderingPhysicianId,
      medicalRecordId: formValue.medicalRecordId || undefined,
      notes: formValue.notes || undefined
    };

    this.radiologyService.createStudy(payload).subscribe({
      next: (study) => {
        this.toastService.success('Imaging study ordered successfully');
        this.closeOrderingWizard();
        this.loadStudies();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to create imaging study');
      }
    });
  }

  // Image management
  openImageUploadModal(study: ImagingStudy) {
    this.selectedStudyForImages = study;
    this.selectedFiles = [];
    this.showImageUploadModal = true;
  }

  closeImageUploadModal() {
    this.showImageUploadModal = false;
    this.selectedStudyForImages = null;
    this.selectedFiles = [];
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  uploadImages() {
    if (!this.selectedStudyForImages || this.selectedFiles.length === 0) {
      this.toastService.warning('Please select at least one image to upload');
      return;
    }

    let uploadCount = 0;
    const totalFiles = this.selectedFiles.length;

    this.selectedFiles.forEach(file => {
      // Check if it's a DICOM file
      const isDICOM = file.name.toLowerCase().endsWith('.dcm') || 
                     file.type === 'application/dicom' ||
                     file.type === 'application/octet-stream';
      
      const uploadObservable = isDICOM
        ? this.radiologyService.uploadDICOM(this.selectedStudyForImages!.id, file)
        : this.radiologyService.uploadImage(this.selectedStudyForImages!.id, file);

      uploadObservable.subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.toastService.success(`Successfully uploaded ${totalFiles} image(s)`);
            this.closeImageUploadModal();
            this.loadStudies();
          }
        },
        error: (err) => {
          this.toastService.error(`Failed to upload ${file.name}: ${err.error?.message || 'Unknown error'}`);
        }
      });
    });
  }

  openImageViewer(study: ImagingStudy) {
    this.selectedStudy = study;
    this.radiologyService.getStudyImages(study.id).subscribe({
      next: (images) => {
        this.selectedImages = images;
        if (images.length > 0) {
          this.currentImageIndex = 0;
          this.loadCurrentImage();
          this.showImageViewer = true;
        } else {
          this.toastService.warning('No images available for this study');
        }
      },
      error: () => {
        this.toastService.error('Failed to load images');
      }
    });
  }

  closeImageViewer() {
    this.showImageViewer = false;
    this.selectedStudy = null;
    this.selectedImages = [];
    this.currentImageIndex = 0;
    this.imageUrl = '';
  }

  loadCurrentImage() {
    if (this.selectedImages.length > 0 && this.selectedStudy) {
      const image = this.selectedImages[this.currentImageIndex];
      this.imageUrl = this.radiologyService.getImageUrl(this.selectedStudy.id, image.id);
    }
  }

  nextImage() {
    if (this.currentImageIndex < this.selectedImages.length - 1) {
      this.currentImageIndex++;
      this.loadCurrentImage();
    }
  }

  prevImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.loadCurrentImage();
    }
  }

  // Report management
  openReportModal(study: ImagingStudy) {
    this.selectedStudyForReport = study;
    this.radiologyService.getReport(study.id).subscribe({
      next: (report) => {
        this.reportForm.patchValue({
          findings: report.findings,
          impression: report.impression,
          recommendations: report.recommendations || '',
          status: report.status
        });
        this.showReportModal = true;
      },
      error: () => {
        // No report exists yet, start with empty form
        this.reportForm.reset({
          findings: '',
          impression: '',
          recommendations: '',
          status: 'Draft'
        });
        this.showReportModal = true;
      }
    });
  }

  closeReportModal() {
    this.showReportModal = false;
    this.selectedStudyForReport = null;
    this.reportForm.reset();
  }

  saveReport() {
    if (this.reportForm.invalid || !this.selectedStudyForReport) {
      this.markFormGroupTouched(this.reportForm);
      this.toastService.error('Please complete all required fields');
      return;
    }

    const formValue = this.reportForm.value;
    const payload: CreateRadiologyReportRequest = {
      imagingStudyId: this.selectedStudyForReport.id,
      findings: formValue.findings,
      impression: formValue.impression,
      recommendations: formValue.recommendations || undefined,
      status: formValue.status
    };

    if (this.selectedStudyForReport.reportId) {
      // Update existing report
      this.radiologyService.updateReport(this.selectedStudyForReport.reportId, payload).subscribe({
        next: () => {
          this.toastService.success('Report updated successfully');
          this.closeReportModal();
          this.loadStudies();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update report');
        }
      });
    } else {
      // Create new report
      this.radiologyService.createReport(this.selectedStudyForReport.id, payload).subscribe({
        next: () => {
          this.toastService.success('Report created successfully');
          this.closeReportModal();
          this.loadStudies();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create report');
        }
      });
    }
  }

  finalizeReport() {
    if (!this.selectedStudyForReport?.reportId) {
      this.toastService.warning('Please save the report first');
      return;
    }

    this.radiologyService.finalizeReport(this.selectedStudyForReport.reportId).subscribe({
      next: () => {
        this.toastService.success('Report finalized successfully');
        this.closeReportModal();
        this.loadStudies();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to finalize report');
      }
    });
  }

  generateReportPDF(study: ImagingStudy) {
    this.radiologyService.generateReportPDF(study.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `radiology-report-${study.accessionNumber || study.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Report PDF generated successfully');
      },
      error: (err) => {
        this.toastService.error('Failed to generate PDF report');
      }
    });
  }

  updateStatus(study: ImagingStudy, newStatus: string) {
    const payload: UpdateImagingStudyRequest = {
      status: newStatus,
      completedDate: newStatus === 'Completed' ? new Date().toISOString() : undefined
    };
    
    this.radiologyService.updateStudy(study.id, payload).subscribe({
      next: () => {
        this.toastService.success(`Study status updated to ${newStatus}`);
        this.loadStudies();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update status');
      }
    });
  }

  deleteStudy(study: ImagingStudy) {
    if (!confirm(`Are you sure you want to delete imaging study "${study.description}" for ${study.patientName || 'patient'}?`)) {
      return;
    }
    this.radiologyService.deleteStudy(study.id).subscribe({
      next: () => {
        this.toastService.success('Imaging study deleted successfully');
        this.loadStudies();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete study');
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Ordered': 'status-ordered',
      'Scheduled': 'status-scheduled',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  getPriorityClass(priority?: string): string {
    const classes: { [key: string]: string } = {
      'Routine': 'priority-routine',
      'Urgent': 'priority-urgent',
      'STAT': 'priority-stat'
    };
    return classes[priority || 'Routine'] || 'priority-routine';
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
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
    if (this.filteredStudies.length === 0) {
      this.toastService.warning('No studies to export');
      return;
    }

    const headers = ['Accession Number', 'Patient', 'Study Type', 'Body Part', 'Status', 'Study Date', 'Priority'];
    const data = this.filteredStudies.map(s => ({
      'Accession Number': s.accessionNumber || '—',
      'Patient': s.patientName || `Patient #${s.patientId}`,
      'Study Type': s.studyType,
      'Body Part': s.bodyPart || '—',
      'Status': s.status,
      'Study Date': s.studyDate ? new Date(s.studyDate).toLocaleDateString() : '—',
      'Priority': s.priority
    }));

    this.exportService.exportToCSV(data, 'radiology-studies', headers);
    this.toastService.success('Studies exported to CSV successfully');
  }
}

