import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TimelineService } from './services/timeline.service';
import { TimelineEvent, TimelineEventType } from './models/timeline.model';
import { ToastService } from '../../../../core/services/toast.service';
import { Appointment } from '../../../appointments/models/appointment.model';
import { LabTest } from '../../../lab-tests/services/lab-test.service';
import { Prescription } from '../../../prescriptions/services/prescription.service';
import { Diagnosis } from '../../../diagnoses/services/diagnosis.service';
import { MedicalRecord } from '../../../medical-records/services/medical-record.service';
import { VitalSigns } from '../../../vital-signs/services/vital-signs.service';

@Component({
  selector: 'app-patient-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-timeline.html',
  styleUrls: ['./patient-timeline.scss']
})
export class PatientTimelineComponent implements OnInit {
  patientId!: number;
  events: TimelineEvent[] = [];
  filteredEvents: TimelineEvent[] = [];
  isLoading = false;
  selectedTypes: TimelineEventType[] = [
    'appointment',
    'lab-test',
    'medication',
    'diagnosis',
    'medical-record',
    'vital-signs'
  ];
  expandedEventId: string | null = null;

  eventTypes: { value: TimelineEventType; label: string; icon: string }[] = [
    { value: 'appointment', label: 'Appointments', icon: 'event' },
    { value: 'lab-test', label: 'Lab Tests', icon: 'science' },
    { value: 'medication', label: 'Medications', icon: 'medication' },
    { value: 'diagnosis', label: 'Diagnoses', icon: 'healing' },
    { value: 'medical-record', label: 'Medical Records', icon: 'folder' },
    { value: 'vital-signs', label: 'Vital Signs', icon: 'monitor_heart' }
  ];

  constructor(
    private timelineService: TimelineService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.patientId = +id;
      this.loadTimeline();
    } else {
      this.toastService.error('Patient ID is required');
      this.router.navigate(['/patients']);
    }
  }

  loadTimeline(): void {
    this.isLoading = true;
    this.timelineService.getPatientTimeline(this.patientId).subscribe({
      next: (data) => {
        this.events = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load timeline');
        console.error('Error loading timeline:', err);
      }
    });
  }

  toggleTypeFilter(type: TimelineEventType): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredEvents = this.events.filter(event => 
      this.selectedTypes.includes(event.type)
    );
  }

  toggleEvent(event: TimelineEvent): void {
    if (this.expandedEventId === event.id) {
      this.expandedEventId = null;
    } else {
      this.expandedEventId = event.id;
    }
  }

  isExpanded(event: TimelineEvent): boolean {
    return this.expandedEventId === event.id;
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  formatDateOnly(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  getEventDetails(event: TimelineEvent): any {
    return event.data;
  }

  isAppointment(data: any): data is Appointment {
    return 'appointmentDate' in data && 'startTime' in data;
  }

  isLabTest(data: any): data is LabTest {
    return 'testName' in data && 'testType' in data;
  }

  isPrescription(data: any): data is Prescription {
    return 'medicationName' in data && 'dosage' in data;
  }

  isDiagnosis(data: any): data is Diagnosis {
    return 'condition' in data;
  }

  isMedicalRecord(data: any): data is MedicalRecord {
    return 'patientId' in data && 'diagnosis' in data;
  }

  isVitalSigns(data: any): data is VitalSigns {
    return 'recordedDate' in data && 'bloodPressureSystolic' in data;
  }

  navigateToPatientList(): void {
    this.router.navigate(['/patients']);
  }

  navigateToPatientSummary(): void {
    this.router.navigate(['/patients', this.patientId, 'summary']);
  }

  getEventCount(type: TimelineEventType): number {
    return this.events.filter(e => e.type === type).length;
  }

  getTypeLabel(type: TimelineEventType): string {
    const labels: { [key: string]: string } = {
      'appointment': 'Appointment',
      'lab-test': 'Lab Test',
      'medication': 'Medication',
      'diagnosis': 'Diagnosis',
      'medical-record': 'Medical Record',
      'vital-signs': 'Vital Signs'
    };
    return labels[type] || type;
  }
}

