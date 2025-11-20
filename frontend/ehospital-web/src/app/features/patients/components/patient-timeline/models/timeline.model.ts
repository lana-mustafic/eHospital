import { Appointment } from '../../../../appointments/models/appointment.model';
import { LabTest } from '../../../../lab-tests/services/lab-test.service';
import { Prescription } from '../../../../prescriptions/services/prescription.service';
import { Diagnosis } from '../../../../diagnoses/services/diagnosis.service';
import { MedicalRecord } from '../../../../medical-records/services/medical-record.service';
import { VitalSigns } from '../../../../vital-signs/services/vital-signs.service';

export type TimelineEventType = 
  | 'appointment' 
  | 'lab-test' 
  | 'medication' 
  | 'diagnosis' 
  | 'medical-record'
  | 'vital-signs';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: Date;
  title: string;
  description: string;
  icon: string;
  color: string;
  data: Appointment | LabTest | Prescription | Diagnosis | MedicalRecord | VitalSigns;
  expanded?: boolean;
}

export interface TimelineFilters {
  types: TimelineEventType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

