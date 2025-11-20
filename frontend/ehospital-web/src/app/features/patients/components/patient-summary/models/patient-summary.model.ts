import { Patient } from '../../../models/patient.model';
import { PatientAllergy } from '../../../../medical-history/services/medical-history.service';
import { Prescription } from '../../../../prescriptions/services/prescription.service';
import { Appointment } from '../../../../appointments/models/appointment.model';
import { VitalSigns } from '../../../../vital-signs/services/vital-signs.service';
import { LabTest } from '../../../../lab-tests/services/lab-test.service';
import { ChronicCondition } from '../../../../medical-history/services/medical-history.service';

export interface PatientSummary {
  patient: Patient;
  demographics: PatientDemographics;
  allergies: PatientAllergy[];
  activeMedications: Prescription[];
  recentVisits: Appointment[];
  vitalSignsTrend: VitalSignsTrend;
  activeProblems: ChronicCondition[];
  recentLabResults: LabTest[];
}

export interface PatientDemographics {
  age: number;
  gender: string;
  bloodType: string;
  emergencyContact: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export interface VitalSignsTrend {
  bloodPressure: VitalSignDataPoint[];
  temperature: VitalSignDataPoint[];
  heartRate: VitalSignDataPoint[];
  respiratoryRate: VitalSignDataPoint[];
  weight: VitalSignDataPoint[];
  oxygenSaturation: VitalSignDataPoint[];
  bloodGlucose: VitalSignDataPoint[];
}

export interface VitalSignDataPoint {
  date: string;
  value: number;
  label?: string;
}

