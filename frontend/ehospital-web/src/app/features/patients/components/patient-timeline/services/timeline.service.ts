import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AppointmentService } from '../../../../appointments/services/appointment.service';
import { LabTestService } from '../../../../lab-tests/services/lab-test.service';
import { PrescriptionService } from '../../../../prescriptions/services/prescription.service';
import { DiagnosisService } from '../../../../diagnoses/services/diagnosis.service';
import { MedicalRecordService } from '../../../../medical-records/services/medical-record.service';
import { VitalSignsService } from '../../../../vital-signs/services/vital-signs.service';
import { TimelineEvent, TimelineEventType } from '../models/timeline.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  constructor(
    private appointmentService: AppointmentService,
    private labTestService: LabTestService,
    private prescriptionService: PrescriptionService,
    private diagnosisService: DiagnosisService,
    private medicalRecordService: MedicalRecordService,
    private vitalSignsService: VitalSignsService
  ) {}

  getPatientTimeline(patientId: number): Observable<TimelineEvent[]> {
    return forkJoin({
      appointments: this.appointmentService.getAll().pipe(
        map(appointments => appointments.filter(a => a.patientId === patientId))
      ),
      labTests: this.labTestService.getByPatient(patientId),
      prescriptions: this.prescriptionService.getAll().pipe(
        map(prescriptions => prescriptions.filter(p => p.patientId === patientId))
      ),
      diagnoses: this.diagnosisService.getAll().pipe(
        map(diagnoses => diagnoses.filter(d => d.patientId === patientId))
      ),
      medicalRecords: this.medicalRecordService.getAll().pipe(
        map(records => records.filter(r => r.patientId === patientId))
      ),
      vitalSigns: this.vitalSignsService.getByPatient(patientId)
    }).pipe(
      map(data => {
        const events: TimelineEvent[] = [];

        // Appointments
        data.appointments.forEach(apt => {
          const date = new Date(`${apt.appointmentDate}T${apt.startTime}`);
          events.push({
            id: `appointment-${apt.id}`,
            type: 'appointment',
            date,
            title: `Appointment with ${apt.doctorName || 'Doctor'}`,
            description: `${apt.reason || 'No reason specified'} - ${apt.startTime} - ${apt.endTime}`,
            icon: 'event',
            color: '#667eea',
            data: apt,
            expanded: false
          });
        });

        // Lab Tests
        data.labTests.forEach(test => {
          const date = test.completedDate 
            ? new Date(test.completedDate) 
            : new Date(test.orderedDate);
          events.push({
            id: `lab-test-${test.id}`,
            type: 'lab-test',
            date,
            title: `Lab Test: ${test.testName}`,
            description: `${test.testType} - Status: ${test.status}`,
            icon: 'science',
            color: '#10b981',
            data: test,
            expanded: false
          });
        });

        // Prescriptions
        data.prescriptions.forEach(prescription => {
          let date = new Date();
          if (prescription.prescribedDate) {
            date = new Date(prescription.prescribedDate);
          } else if (prescription.issuedAt) {
            date = new Date(prescription.issuedAt);
          }
          events.push({
            id: `prescription-${prescription.id}`,
            type: 'medication',
            date,
            title: `Prescription: ${prescription.medicationName}`,
            description: `Dosage: ${prescription.dosage} - Status: ${prescription.status || 'Active'}`,
            icon: 'medication',
            color: '#ef4444',
            data: prescription,
            expanded: false
          });
        });

        // Diagnoses
        data.diagnoses.forEach(diagnosis => {
          const date = diagnosis.createdAt 
            ? new Date(diagnosis.createdAt) 
            : new Date();
          events.push({
            id: `diagnosis-${diagnosis.id}`,
            type: 'diagnosis',
            date,
            title: `Diagnosis: ${diagnosis.condition}`,
            description: diagnosis.notes || 'No additional notes',
            icon: 'healing',
            color: '#f59e0b',
            data: diagnosis,
            expanded: false
          });
        });

        // Medical Records
        data.medicalRecords.forEach(record => {
          const date = record.createdAt 
            ? new Date(record.createdAt) 
            : new Date();
          events.push({
            id: `medical-record-${record.id}`,
            type: 'medical-record',
            date,
            title: `Medical Record: ${record.diagnosis || 'Visit'}`,
            description: record.notes || 'No notes',
            icon: 'folder',
            color: '#8b5cf6',
            data: record,
            expanded: false
          });
        });

        // Vital Signs
        data.vitalSigns.forEach(vs => {
          const date = new Date(vs.recordedDate);
          events.push({
            id: `vital-signs-${vs.id}`,
            type: 'vital-signs',
            date,
            title: 'Vital Signs Recorded',
            description: this.formatVitalSignsDescription(vs),
            icon: 'monitor_heart',
            color: '#06b6d4',
            data: vs,
            expanded: false
          });
        });

        // Sort by date (newest first)
        return events.sort((a, b) => b.date.getTime() - a.date.getTime());
      })
    );
  }

  private formatVitalSignsDescription(vs: any): string {
    const parts: string[] = [];
    if (vs.bloodPressureSystolic && vs.bloodPressureDiastolic) {
      parts.push(`BP: ${vs.bloodPressureSystolic}/${vs.bloodPressureDiastolic}`);
    }
    if (vs.temperature) parts.push(`Temp: ${vs.temperature}°F`);
    if (vs.heartRate) parts.push(`HR: ${vs.heartRate} bpm`);
    if (vs.respiratoryRate) parts.push(`RR: ${vs.respiratoryRate} rpm`);
    if (vs.oxygenSaturation) parts.push(`SpO2: ${vs.oxygenSaturation}%`);
    return parts.length > 0 ? parts.join(' | ') : 'Vital signs recorded';
  }
}

