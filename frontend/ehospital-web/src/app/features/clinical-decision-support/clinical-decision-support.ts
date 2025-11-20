import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClinicalDecisionSupportService } from './services/cds.service';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import {
  DrugInteraction,
  ClinicalGuideline,
  ProtocolSuggestion,
  CriticalValueAlert,
  CDSDashboard,
  CheckInteractionRequest
} from './models/cds.model';
import { PatientService } from '../patients/services/patient.service';
import { MedicationService, Medication } from '../medications/services/medication.service';
import { PrescriptionService, Prescription } from '../prescriptions/services/prescription.service';
import { Patient } from '../patients/models/patient.model';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-clinical-decision-support',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clinical-decision-support.html',
  styleUrls: ['./clinical-decision-support.scss']
})
export class ClinicalDecisionSupportComponent implements OnInit {
  activeTab: 'dashboard' | 'interactions' | 'guidelines' | 'protocols' | 'alerts' | 'reminders' = 'dashboard';

  // Dashboard
  dashboard: CDSDashboard | null = null;
  isLoading = false;

  // Drug Interactions
  interactions: DrugInteraction[] = [];
  filteredInteractions: DrugInteraction[] = [];
  showInteractionModal = false;
  interactionCheckForm: FormGroup;
  selectedMedications: Medication[] = [];
  availableMedications: Medication[] = [];
  checkResult: any = null;
  patientFilter: number | null = null;
  patients: Patient[] = [];

  // Clinical Guidelines
  guidelines: ClinicalGuideline[] = [];
  filteredGuidelines: ClinicalGuideline[] = [];
  selectedGuideline: ClinicalGuideline | null = null;
  showGuidelineModal = false;
  guidelineSearchTerm = '';
  guidelineCategoryFilter = '';
  guidelineConditionFilter = '';

  // Protocol Suggestions
  protocols: ProtocolSuggestion[] = [];
  filteredProtocols: ProtocolSuggestion[] = [];
  selectedProtocol: ProtocolSuggestion | null = null;
  showProtocolModal = false;
  protocolSearchForm: FormGroup;

  // Critical Value Alerts
  alerts: CriticalValueAlert[] = [];
  filteredAlerts: CriticalValueAlert[] = [];
  unacknowledgedAlerts: CriticalValueAlert[] = [];
  alertSeverityFilter = '';
  alertSearchTerm = '';

  // Reminders
  reminders: ClinicalGuideline[] = [];
  filteredReminders: ClinicalGuideline[] = [];

  constructor(
    private cdsService: ClinicalDecisionSupportService,
    private patientService: PatientService,
    private medicationService: MedicationService,
    private prescriptionService: PrescriptionService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.interactionCheckForm = this.fb.group({
      patientId: [''],
      medicationIds: [[], Validators.required]
    });

    this.protocolSearchForm = this.fb.group({
      condition: ['', Validators.required],
      patientId: [''],
      symptoms: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPatients();
    this.loadMedications();
    this.loadInteractions();
    this.loadGuidelines();
    this.loadProtocols();
    this.loadAlerts();
    this.loadReminders();
  }

  // Dashboard
  loadDashboard() {
    this.isLoading = true;
    this.cdsService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load dashboard');
        this.isLoading = false;
      }
    });
  }

  // Drug Interactions
  loadInteractions() {
    this.isLoading = true;
    if (this.patientFilter) {
      this.cdsService.getInteractionsByPatient(this.patientFilter).subscribe({
        next: (data) => {
          this.interactions = data;
          this.filteredInteractions = data;
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Failed to load interactions');
          this.isLoading = false;
        }
      });
    } else {
      this.cdsService.getAllInteractions().subscribe({
        next: (data) => {
          this.interactions = data;
          this.filteredInteractions = data;
          this.isLoading = false;
        },
        error: () => {
          this.toastService.error('Failed to load interactions');
          this.isLoading = false;
        }
      });
    }
  }

  openInteractionCheckModal() {
    this.selectedMedications = [];
    this.checkResult = null;
    this.interactionCheckForm.reset();
    this.showInteractionModal = true;
  }

  closeInteractionModal() {
    this.showInteractionModal = false;
    this.selectedMedications = [];
    this.checkResult = null;
  }

  addMedicationToCheck(medicationId: string | number) {
    const id = typeof medicationId === 'string' ? parseInt(medicationId, 10) : medicationId;
    if (isNaN(id) || id === 0) return;
    
    const medication = this.availableMedications.find(m => m.id === id);
    if (medication && !this.selectedMedications.find(m => m.id === medication.id)) {
      this.selectedMedications.push(medication);
      this.updateMedicationIds();
    }
  }

  removeMedicationFromCheck(medication: Medication) {
    this.selectedMedications = this.selectedMedications.filter(m => m.id !== medication.id);
    this.updateMedicationIds();
  }

  updateMedicationIds() {
    const medicationIds = this.selectedMedications.map(m => m.id);
    this.interactionCheckForm.patchValue({ medicationIds });
  }

  checkInteractions() {
    if (this.interactionCheckForm.invalid || this.selectedMedications.length < 2) {
      this.toastService.warning('Please select at least 2 medications to check interactions');
      return;
    }

    const formValue = this.interactionCheckForm.value;
    const request: CheckInteractionRequest = {
      medicationIds: formValue.medicationIds,
      patientId: formValue.patientId || undefined
    };

    this.isLoading = true;
    this.cdsService.checkInteractions(request).subscribe({
      next: (result) => {
        this.checkResult = result;
        if (result.hasInteractions) {
          this.toastService.warning(result.alertMessage || 'Drug interactions detected!');
        } else {
          this.toastService.success('No drug interactions detected');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to check interactions');
        this.isLoading = false;
      }
    });
  }

  onPatientFilterChange() {
    this.loadInteractions();
  }

  getSeverityClass(severity: string): string {
    const classes: { [key: string]: string } = {
      'Mild': 'severity-mild',
      'Moderate': 'severity-moderate',
      'Severe': 'severity-severe',
      'Life-threatening': 'severity-critical'
    };
    return classes[severity] || 'severity-mild';
  }

  // Clinical Guidelines
  loadGuidelines() {
    this.isLoading = true;
    this.cdsService.getGuidelines({
      condition: this.guidelineConditionFilter || undefined,
      category: this.guidelineCategoryFilter || undefined
    }).subscribe({
      next: (data) => {
        this.guidelines = data;
        this.applyGuidelineFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load guidelines');
        this.isLoading = false;
      }
    });
  }

  applyGuidelineFilters() {
    let filtered = [...this.guidelines];

    if (this.guidelineSearchTerm) {
      const term = this.guidelineSearchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(term) ||
        g.condition.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term)
      );
    }

    this.filteredGuidelines = filtered;
  }

  openGuidelineModal(guideline: ClinicalGuideline) {
    this.selectedGuideline = guideline;
    this.showGuidelineModal = true;
  }

  closeGuidelineModal() {
    this.showGuidelineModal = false;
    this.selectedGuideline = null;
  }

  getEvidenceLevelClass(level: string): string {
    const classes: { [key: string]: string } = {
      'A': 'evidence-a',
      'B': 'evidence-b',
      'C': 'evidence-c',
      'D': 'evidence-d'
    };
    return classes[level] || 'evidence-d';
  }

  // Protocol Suggestions
  loadProtocols() {
    this.isLoading = true;
    this.cdsService.getAllProtocols().subscribe({
      next: (data) => {
        this.protocols = data;
        this.filteredProtocols = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load protocols');
        this.isLoading = false;
      }
    });
  }

  searchProtocols() {
    if (this.protocolSearchForm.invalid) {
      this.toastService.warning('Please enter a condition to search for protocols');
      return;
    }

    const formValue = this.protocolSearchForm.value;
    const request = {
      condition: formValue.condition,
      patientId: formValue.patientId || undefined,
      symptoms: formValue.symptoms ? formValue.symptoms.split(',').map((s: string) => s.trim()) : undefined
    };

    this.isLoading = true;
    this.cdsService.getProtocolSuggestions(request).subscribe({
      next: (data) => {
        this.protocols = data;
        this.filteredProtocols = data;
        if (data.length === 0) {
          this.toastService.info('No protocol suggestions found for this condition');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to search protocols');
        this.isLoading = false;
      }
    });
  }

  openProtocolModal(protocol: ProtocolSuggestion) {
    this.selectedProtocol = protocol;
    this.showProtocolModal = true;
  }

  closeProtocolModal() {
    this.showProtocolModal = false;
    this.selectedProtocol = null;
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'Routine': 'priority-routine',
      'Urgent': 'priority-urgent',
      'Critical': 'priority-critical'
    };
    return classes[priority] || 'priority-routine';
  }

  // Critical Value Alerts
  loadAlerts() {
    this.isLoading = true;
    this.cdsService.getCriticalAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
        this.unacknowledgedAlerts = data.filter(a => !a.acknowledged);
        this.applyAlertFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load alerts');
        this.isLoading = false;
      }
    });
  }

  applyAlertFilters() {
    let filtered = [...this.alerts];

    if (this.alertSeverityFilter) {
      filtered = filtered.filter(a => a.severity === this.alertSeverityFilter);
    }

    if (this.alertSearchTerm) {
      const term = this.alertSearchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.patientName.toLowerCase().includes(term) ||
        a.testName.toLowerCase().includes(term) ||
        a.parameter.toLowerCase().includes(term)
      );
    }

    this.filteredAlerts = filtered;
  }

  acknowledgeAlert(alert: CriticalValueAlert) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not found');
      return;
    }

    this.cdsService.acknowledgeAlert(alert.id, currentUser.name).subscribe({
      next: () => {
        this.toastService.success('Alert acknowledged');
        this.loadAlerts();
        this.loadDashboard();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to acknowledge alert');
      }
    });
  }

  getAlertSeverityClass(severity: string): string {
    const classes: { [key: string]: string } = {
      'Warning': 'alert-warning',
      'Critical': 'alert-critical',
      'Life-threatening': 'alert-life-threatening'
    };
    return classes[severity] || 'alert-warning';
  }

  // Reminders
  loadReminders() {
    this.isLoading = true;
    this.cdsService.getReminders().subscribe({
      next: (data) => {
        this.reminders = data;
        this.filteredReminders = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load reminders');
        this.isLoading = false;
      }
    });
  }

  // Utility
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

  loadMedications() {
    this.medicationService.getAll().subscribe({
      next: (data) => {
        this.availableMedications = data;
      },
      error: () => {
        this.toastService.error('Failed to load medications');
      }
    });
  }

  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }
}

