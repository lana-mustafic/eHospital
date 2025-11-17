import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface DischargeSummary {
  id: number;
  dischargeNumber: string;
  dischargeDate: string;
  admissionDate?: string;
  dischargeType: string;
  conditionOnDischarge: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  hospitalCourse: string;
  proceduresPerformed: string;
  dischargeDiagnosis: string;
  postDischargeInstructions: string;
  activityRestrictions: string;
  dietInstructions: string;
  medicationInstructions: string;
  warningSigns: string;
  followUpDate?: string;
  followUpDoctorId?: number;
  followUpDoctorName?: string;
  followUpInstructions: string;
  additionalNotes: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  finalizedAt?: string;
  patientId: number;
  patientName?: string;
  dischargingDoctorId: number;
  dischargingDoctorName?: string;
  medicalRecordId?: number;
  appointmentId?: number;
  createdByUserId?: number;
  createdByUserName?: string;
  dischargeMedications: DischargeMedication[];
}

export interface DischargeMedication {
  prescriptionId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface CreateDischargeSummaryRequest {
  dischargeDate: string;
  admissionDate?: string;
  dischargeType: string;
  conditionOnDischarge: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  hospitalCourse: string;
  proceduresPerformed: string;
  dischargeDiagnosis: string;
  postDischargeInstructions: string;
  activityRestrictions: string;
  dietInstructions: string;
  medicationInstructions: string;
  warningSigns: string;
  followUpDate?: string;
  followUpDoctorId?: number;
  followUpInstructions: string;
  additionalNotes: string;
  patientId: number;
  dischargingDoctorId: number;
  medicalRecordId?: number;
  appointmentId?: number;
  createdByUserId?: number;
  prescriptionIds: number[];
}

export interface UpdateDischargeSummaryRequest {
  dischargeDate?: string;
  admissionDate?: string;
  dischargeType?: string;
  conditionOnDischarge?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  hospitalCourse?: string;
  proceduresPerformed?: string;
  dischargeDiagnosis?: string;
  postDischargeInstructions?: string;
  activityRestrictions?: string;
  dietInstructions?: string;
  medicationInstructions?: string;
  warningSigns?: string;
  followUpDate?: string;
  followUpDoctorId?: number;
  followUpInstructions?: string;
  additionalNotes?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class DischargeSummaryService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/dischargesummaries`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DischargeSummary[]> {
    return this.http.get<DischargeSummary[]>(this.apiUrl);
  }

  getById(id: number): Observable<DischargeSummary> {
    return this.http.get<DischargeSummary>(`${this.apiUrl}/${id}`);
  }

  getByDischargeNumber(dischargeNumber: string): Observable<DischargeSummary> {
    return this.http.get<DischargeSummary>(`${this.apiUrl}/number/${dischargeNumber}`);
  }

  getByPatient(patientId: number): Observable<DischargeSummary[]> {
    return this.http.get<DischargeSummary[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByDoctor(doctorId: number): Observable<DischargeSummary[]> {
    return this.http.get<DischargeSummary[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  create(payload: CreateDischargeSummaryRequest): Observable<DischargeSummary> {
    return this.http.post<DischargeSummary>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateDischargeSummaryRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  finalize(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/finalize`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateDischargeNumber(): Observable<{ dischargeNumber: string }> {
    return this.http.get<{ dischargeNumber: string }>(`${this.apiUrl}/generate-number`);
  }

  generatePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}

