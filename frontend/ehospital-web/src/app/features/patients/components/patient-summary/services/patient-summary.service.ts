import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { PatientService } from '../../../services/patient.service';
import { MedicalHistoryService } from '../../../../medical-history/services/medical-history.service';
import { PrescriptionService } from '../../../../prescriptions/services/prescription.service';
import { AppointmentService } from '../../../../appointments/services/appointment.service';
import { VitalSignsService } from '../../../../vital-signs/services/vital-signs.service';
import { LabTestService } from '../../../../lab-tests/services/lab-test.service';
import { PatientSummary, VitalSignsTrend, VitalSignDataPoint } from '../models/patient-summary.model';
import { Patient } from '../../../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientSummaryService {
  constructor(
    private patientService: PatientService,
    private medicalHistoryService: MedicalHistoryService,
    private prescriptionService: PrescriptionService,
    private appointmentService: AppointmentService,
    private vitalSignsService: VitalSignsService,
    private labTestService: LabTestService
  ) {}

  getPatientSummary(patientId: number): Observable<PatientSummary> {
    return forkJoin({
      patient: this.patientService.getById(patientId),
      allergies: this.medicalHistoryService.getActiveAllergiesByPatient(patientId),
      prescriptions: this.prescriptionService.getAll().pipe(
        map(prescriptions => prescriptions.filter(p => p.patientId === patientId))
      ),
      appointments: this.appointmentService.getAll().pipe(
        map(appointments => appointments.filter(a => a.patientId === patientId))
      ),
      vitalSigns: this.vitalSignsService.getByPatient(patientId),
      labTests: this.labTestService.getByPatient(patientId),
      conditions: this.medicalHistoryService.getActiveConditionsByPatient(patientId)
    }).pipe(
      map(data => {
        const patient = data.patient;
        const activeMedications = data.prescriptions
          .filter(p => p.status === 'Verified' || p.status === 'Dispensed' || p.status === 'Pending')
          .slice(0, 10);

        const recentVisits = data.appointments
          .filter(a => a.patientId === patientId)
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
          .slice(0, 5);

        const recentLabResults = data.labTests
          .filter(lt => lt.status === 'Completed')
          .sort((a, b) => {
            const dateA = b.completedDate ? new Date(b.completedDate).getTime() : 0;
            const dateB = a.completedDate ? new Date(a.completedDate).getTime() : 0;
            return dateA - dateB;
          })
          .slice(0, 5);

        const vitalSignsTrend = this.buildVitalSignsTrend(data.vitalSigns);

        const demographics = {
          age: this.calculateAge(patient.dateOfBirth),
          gender: patient.gender,
          bloodType: patient.bloodType,
          emergencyContact: patient.emergencyContact,
          address: patient.address,
          phoneNumber: patient.phoneNumber,
          email: patient.email
        };

        return {
          patient,
          demographics,
          allergies: data.allergies,
          activeMedications,
          recentVisits,
          vitalSignsTrend,
          activeProblems: data.conditions,
          recentLabResults
        };
      })
    );
  }

  private buildVitalSignsTrend(vitalSigns: any[]): VitalSignsTrend {
    const sorted = vitalSigns
      .filter(vs => vs.recordedDate)
      .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime())
      .slice(-30); // Last 30 readings

    return {
      bloodPressure: sorted
        .filter(vs => vs.bloodPressureSystolic && vs.bloodPressureDiastolic)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.bloodPressureSystolic,
          label: `${vs.bloodPressureSystolic}/${vs.bloodPressureDiastolic}`
        })),
      temperature: sorted
        .filter(vs => vs.temperature)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.temperature
        })),
      heartRate: sorted
        .filter(vs => vs.heartRate)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.heartRate
        })),
      respiratoryRate: sorted
        .filter(vs => vs.respiratoryRate)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.respiratoryRate
        })),
      weight: sorted
        .filter(vs => vs.weight)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.weight
        })),
      oxygenSaturation: sorted
        .filter(vs => vs.oxygenSaturation)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.oxygenSaturation
        })),
      bloodGlucose: sorted
        .filter(vs => vs.bloodGlucose)
        .map(vs => ({
          date: vs.recordedDate,
          value: vs.bloodGlucose
        }))
    };
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

