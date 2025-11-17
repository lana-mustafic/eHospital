import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AppointmentService } from '../../../appointments/services/appointment.service';
import { MedicalRecordService } from '../../../medical-records/services/medical-record.service';
import { DiagnosisService } from '../../../diagnoses/services/diagnosis.service';
import { PrescriptionService } from '../../../prescriptions/services/prescription.service';
import { Appointment } from '../../../appointments/models/appointment.model';
import { MedicalRecord } from '../../../medical-records/services/medical-record.service';
import { Diagnosis } from '../../../diagnoses/services/diagnosis.service';
import { Prescription } from '../../../prescriptions/services/prescription.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface TimelineItem {
  id: string;
  type: 'appointment' | 'medical-record' | 'diagnosis' | 'prescription';
  date: Date;
  title: string;
  description: string;
  icon: string;
  color: string;
  data: any;
}

@Component({
  selector: 'app-patient-history-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-history-timeline.component.html',
  styleUrls: ['./patient-history-timeline.component.scss']
})
export class PatientHistoryTimelineComponent implements OnInit {
  @Input() patientId!: number;
  @Input() showPatientName = false;
  
  timelineItems: TimelineItem[] = [];
  isLoading = false;
  filteredItems: TimelineItem[] = [];
  filterType: 'all' | 'appointment' | 'medical-record' | 'diagnosis' | 'prescription' = 'all';

  constructor(
    private appointmentService: AppointmentService,
    private medicalRecordService: MedicalRecordService,
    private diagnosisService: DiagnosisService,
    private prescriptionService: PrescriptionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.patientId) {
      this.loadTimeline();
    }
  }

  loadTimeline(): void {
    this.isLoading = true;
    this.timelineItems = [];

    // Load all data in parallel
    Promise.all([
      this.loadAppointments(),
      this.loadMedicalRecords(),
      this.loadDiagnoses(),
      this.loadPrescriptions()
    ]).then(() => {
      this.sortTimeline();
      this.applyFilter();
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
      this.toastService.error('Failed to load patient history');
    });
  }

  private async loadAppointments(): Promise<void> {
    try {
      const appointments = await firstValueFrom(this.appointmentService.getAll());
      const patientAppointments = appointments.filter(apt => apt.patientId === this.patientId);
      
      patientAppointments.forEach(apt => {
        const date = new Date(`${apt.appointmentDate}T${apt.startTime}`);
        this.timelineItems.push({
          id: `appointment-${apt.id}`,
          type: 'appointment',
          date,
          title: `Appointment with ${apt.doctorName || 'Doctor'}`,
          description: `${apt.reason || 'No reason specified'} - Status: ${apt.status}`,
          icon: 'event',
          color: '#667eea',
          data: apt
        });
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  private async loadMedicalRecords(): Promise<void> {
    try {
      const records = await firstValueFrom(this.medicalRecordService.getAll());
      const patientRecords = records.filter(record => record.patientId === this.patientId);
      
      patientRecords.forEach(record => {
        const date = new Date(record.createdAt);
        this.timelineItems.push({
          id: `record-${record.id}`,
          type: 'medical-record',
          date,
          title: `Medical Record: ${record.diagnosis || 'General Note'}`,
          description: record.notes || 'No notes',
          icon: 'folder',
          color: '#10b981',
          data: record
        });
      });
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  }

  private async loadDiagnoses(): Promise<void> {
    try {
      const diagnoses = await firstValueFrom(this.diagnosisService.getAll());
      const patientDiagnoses = diagnoses.filter(diagnosis => diagnosis.patientId === this.patientId);
      
      patientDiagnoses.forEach(diagnosis => {
        const date = new Date(diagnosis.createdAt);
        this.timelineItems.push({
          id: `diagnosis-${diagnosis.id}`,
          type: 'diagnosis',
          date,
          title: `Diagnosis: ${diagnosis.condition}`,
          description: `${diagnosis.severity ? `Severity: ${diagnosis.severity}` : ''} ${diagnosis.notes ? `- ${diagnosis.notes}` : ''}`.trim(),
          icon: 'healing',
          color: '#f59e0b',
          data: diagnosis
        });
      });
    } catch (error) {
      console.error('Error loading diagnoses:', error);
    }
  }

  private async loadPrescriptions(): Promise<void> {
    try {
      const prescriptions = await firstValueFrom(this.prescriptionService.getAll());
      const patientPrescriptions = prescriptions.filter(prescription => prescription.patientId === this.patientId);
      
      patientPrescriptions.forEach(prescription => {
        const date = new Date(prescription.issuedAt);
        this.timelineItems.push({
          id: `prescription-${prescription.id}`,
          type: 'prescription',
          date,
          title: `Prescription: ${prescription.medicationName}`,
          description: `Dosage: ${prescription.dosage} - ${prescription.instructions || 'No instructions'}`,
          icon: 'medication',
          color: '#ef4444',
          data: prescription
        });
      });
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  }

  private sortTimeline(): void {
    this.timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  applyFilter(): void {
    if (this.filterType === 'all') {
      this.filteredItems = [...this.timelineItems];
    } else {
      this.filteredItems = this.timelineItems.filter(item => item.type === this.filterType);
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'appointment': 'Appointment',
      'medical-record': 'Medical Record',
      'diagnosis': 'Diagnosis',
      'prescription': 'Prescription'
    };
    return labels[type] || type;
  }
}

