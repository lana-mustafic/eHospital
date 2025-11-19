import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EDVisitService } from './services/ed-visit.service';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { EDVisit, CreateEDVisitRequest, UpdateEDVisitRequest, TriageRequest, DischargeRequest, EDStatistics } from './models/ed-visit.model';
import { Patient } from '../patients/models/patient.model';
import { Doctor } from '../doctors/models/doctor.model';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emergency.html',
  styleUrls: ['./emergency.scss']
})
export class EmergencyComponent implements OnInit, OnDestroy {
  visits: EDVisit[] = [];
  activeVisits: EDVisit[] = [];
  filteredVisits: EDVisit[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  statistics: EDStatistics = { activeVisits: 0, critical: 0, urgent: 0, nonUrgent: 0 };
  isLoading = false;
  error: string | null = null;

  // Filters
  statusFilter: string = '';
  priorityFilter: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];

  // Modals
  showAddModal = false;
  showTriageModal = false;
  showTreatmentModal = false;
  showDischargeModal = false;
  selectedVisit: EDVisit | null = null;

  // Forms
  newVisit: CreateEDVisitRequest = {
    patientId: 0,
    chiefComplaint: '',
    triagePriority: 'Non-Urgent'
  };

  triageRequest: TriageRequest = {
    edVisitId: 0,
    triagePriority: 'Non-Urgent',
    chiefComplaint: ''
  };

  updateRequest: UpdateEDVisitRequest = {};

  dischargeRequest: DischargeRequest = {
    disposition: 'Discharge',
    notes: ''
  };

  autoRefresh = true;
  private refreshSubscription?: Subscription;

  constructor(
    private edVisitService: EDVisitService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadVisits();
    this.loadStatistics();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  setupAutoRefresh(): void {
    if (this.autoRefresh) {
      this.refreshSubscription = interval(10000).subscribe(() => {
        this.loadActiveVisits();
        this.loadStatistics();
      });
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    } else {
      this.refreshSubscription?.unsubscribe();
    }
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
      }
    });
  }

  loadVisits(): void {
    this.isLoading = true;
    this.error = null;
    this.edVisitService.getAllVisits().subscribe({
      next: (data) => {
        this.visits = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ED visits.';
        this.toastService.error('Error loading ED visits');
        console.error('Error loading ED visits:', err);
        this.isLoading = false;
      }
    });
  }

  loadActiveVisits(): void {
    this.edVisitService.getActiveVisits().subscribe({
      next: (data) => {
        this.activeVisits = data;
        // Update visits list with active visits
        this.visits = this.visits.map(v => {
          const active = data.find(a => a.id === v.id);
          return active || v;
        });
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading active visits:', err);
      }
    });
  }

  loadStatistics(): void {
    this.edVisitService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  applyFilters(): void {
    let tempVisits = [...this.visits];

    if (this.statusFilter) {
      tempVisits = tempVisits.filter(v => v.status === this.statusFilter);
    }

    if (this.priorityFilter) {
      tempVisits = tempVisits.filter(v => v.triagePriority === this.priorityFilter);
    }

    if (this.selectedDate) {
      tempVisits = tempVisits.filter(v => {
        const visitDate = new Date(v.arrivalTime).toISOString().split('T')[0];
        return visitDate === this.selectedDate;
      });
    }

    // Sort by priority and arrival time
    tempVisits.sort((a, b) => {
      const priorityOrder = { 'Critical': 1, 'Urgent': 2, 'Non-Urgent': 3 };
      const priorityDiff = (priorityOrder[a.triagePriority] || 3) - (priorityOrder[b.triagePriority] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
    });

    this.filteredVisits = tempVisits;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openAddModal(): void {
    this.newVisit = {
      patientId: 0,
      chiefComplaint: '',
      triagePriority: 'Non-Urgent'
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  createVisit(): void {
    if (!this.newVisit.patientId || !this.newVisit.chiefComplaint) {
      this.toastService.error('Please fill all required fields');
      return;
    }

    this.edVisitService.createVisit(this.newVisit).subscribe({
      next: (visit) => {
        this.toastService.success('ED visit created successfully');
        this.closeAddModal();
        this.loadVisits();
        this.loadActiveVisits();
        this.loadStatistics();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to create ED visit');
        console.error('Error creating ED visit:', err);
      }
    });
  }

  openTriageModal(visit: EDVisit): void {
    this.selectedVisit = { ...visit };
    this.triageRequest = {
      edVisitId: visit.id,
      triagePriority: visit.triagePriority,
      chiefComplaint: visit.chiefComplaint,
      triageNotes: visit.triageNotes,
      bloodPressureSystolic: visit.bloodPressureSystolic,
      bloodPressureDiastolic: visit.bloodPressureDiastolic,
      temperature: visit.temperature,
      heartRate: visit.heartRate,
      respiratoryRate: visit.respiratoryRate,
      oxygenSaturation: visit.oxygenSaturation,
      painScale: visit.painScale
    };
    this.showTriageModal = true;
  }

  closeTriageModal(): void {
    this.showTriageModal = false;
    this.selectedVisit = null;
  }

  performTriage(): void {
    if (!this.triageRequest.triagePriority || !this.triageRequest.chiefComplaint) {
      this.toastService.error('Priority and chief complaint are required');
      return;
    }

    this.edVisitService.performTriage(this.selectedVisit!.id, this.triageRequest).subscribe({
      next: (visit) => {
        this.toastService.success('Triage completed successfully');
        this.closeTriageModal();
        this.loadVisits();
        this.loadActiveVisits();
        this.loadStatistics();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to perform triage');
        console.error('Error performing triage:', err);
      }
    });
  }

  openTreatmentModal(visit: EDVisit): void {
    this.selectedVisit = { ...visit };
    this.updateRequest = {
      treatmentNotes: visit.treatmentNotes,
      diagnosis: visit.diagnosis,
      medicationsGiven: visit.medicationsGiven,
      proceduresPerformed: visit.proceduresPerformed,
      assignedDoctorId: visit.assignedDoctorId
    };
    this.showTreatmentModal = true;
  }

  closeTreatmentModal(): void {
    this.showTreatmentModal = false;
    this.selectedVisit = null;
  }

  startTreatment(visit: EDVisit, doctorId: number): void {
    this.edVisitService.startTreatment(visit.id, doctorId).subscribe({
      next: (updatedVisit) => {
        this.toastService.success('Treatment started');
        this.loadVisits();
        this.loadActiveVisits();
        this.loadStatistics();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to start treatment');
        console.error('Error starting treatment:', err);
      }
    });
  }

  updateTreatment(): void {
    if (!this.selectedVisit) return;

    this.edVisitService.updateVisit(this.selectedVisit.id, this.updateRequest).subscribe({
      next: (visit) => {
        this.toastService.success('Treatment updated successfully');
        this.closeTreatmentModal();
        this.loadVisits();
        this.loadActiveVisits();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update treatment');
        console.error('Error updating treatment:', err);
      }
    });
  }

  openDischargeModal(visit: EDVisit): void {
    this.selectedVisit = { ...visit };
    this.dischargeRequest = {
      disposition: visit.disposition || 'Discharge',
      notes: visit.dispositionNotes || ''
    };
    this.showDischargeModal = true;
  }

  closeDischargeModal(): void {
    this.showDischargeModal = false;
    this.selectedVisit = null;
  }

  dischargePatient(): void {
    if (!this.selectedVisit || !this.dischargeRequest.disposition) {
      this.toastService.error('Disposition is required');
      return;
    }

    this.edVisitService.dischargePatient(this.selectedVisit.id, this.dischargeRequest).subscribe({
      next: (visit) => {
        this.toastService.success('Patient discharged successfully');
        this.closeDischargeModal();
        this.loadVisits();
        this.loadActiveVisits();
        this.loadStatistics();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to discharge patient');
        console.error('Error discharging patient:', err);
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'Urgent': return 'priority-urgent';
      case 'Non-Urgent': return 'priority-nonurgent';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Triage': return 'status-triage';
      case 'Treatment': return 'status-treatment';
      case 'Discharged': return 'status-discharged';
      case 'Admitted': return 'status-admitted';
      case 'Transferred': return 'status-transferred';
      case 'Deceased': return 'status-deceased';
      default: return '';
    }
  }

  formatTime(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDuration(minutes?: number): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  canPerformTriage(visit: EDVisit): boolean {
    return visit.status === 'Triage' && this.authService.hasRole('Nurse');
  }

  canStartTreatment(visit: EDVisit): boolean {
    return (visit.status === 'Triage' || visit.status === 'Treatment') && this.authService.hasRole('Doctor');
  }

  canDischarge(visit: EDVisit): boolean {
    return visit.status === 'Treatment' && this.authService.hasRole('Doctor');
  }
}

