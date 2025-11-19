export interface EDVisit {
  id: number;
  arrivalTime: string;
  triageTime?: string;
  treatmentStartTime?: string;
  dischargeTime?: string;
  
  // Triage Information
  triagePriority: 'Critical' | 'Urgent' | 'Non-Urgent';
  chiefComplaint: string;
  triageNotes?: string;
  
  // Vital Signs
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  painScale?: number;
  
  // Status and Disposition
  status: 'Triage' | 'Treatment' | 'Discharged' | 'Admitted' | 'Transferred' | 'Deceased';
  disposition?: string;
  dispositionNotes?: string;
  
  // Treatment Information
  treatmentNotes?: string;
  diagnosis?: string;
  medicationsGiven?: string;
  proceduresPerformed?: string;
  
  // Wait Times
  waitTimeToTriage?: number;
  waitTimeToTreatment?: number;
  totalEDStayTime?: number;
  
  createdAt: string;
  updatedAt?: string;
  
  // Patient Information
  patientId: number;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientBloodType: string;
  
  // Staff Information
  triageNurseId?: number;
  triageNurseName?: string;
  assignedDoctorId?: number;
  assignedDoctorName?: string;
  treatedByDoctorId?: number;
  treatedByDoctorName?: string;
}

export interface CreateEDVisitRequest {
  patientId: number;
  chiefComplaint: string;
  triagePriority?: 'Critical' | 'Urgent' | 'Non-Urgent';
  triageNotes?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  painScale?: number;
  triageNurseId?: number;
  assignedDoctorId?: number;
}

export interface UpdateEDVisitRequest {
  triagePriority?: 'Critical' | 'Urgent' | 'Non-Urgent';
  chiefComplaint?: string;
  triageNotes?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  painScale?: number;
  status?: string;
  disposition?: string;
  dispositionNotes?: string;
  treatmentNotes?: string;
  diagnosis?: string;
  medicationsGiven?: string;
  proceduresPerformed?: string;
  assignedDoctorId?: number;
  treatedByDoctorId?: number;
}

export interface TriageRequest {
  edVisitId: number;
  triagePriority: 'Critical' | 'Urgent' | 'Non-Urgent';
  chiefComplaint: string;
  triageNotes?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  painScale?: number;
  triageNurseId?: number;
  assignedDoctorId?: number;
}

export interface DischargeRequest {
  disposition: string;
  notes?: string;
}

export interface EDStatistics {
  activeVisits: number;
  critical: number;
  urgent: number;
  nonUrgent: number;
}

