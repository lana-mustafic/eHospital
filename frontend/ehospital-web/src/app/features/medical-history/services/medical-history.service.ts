import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface PatientAllergy {
  id: number;
  allergenName: string;
  allergyType: string;
  severity: string;
  reaction?: string;
  onsetDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  patientId: number;
  patientName?: string;
  recordedByUserId?: number;
  recordedByUserName?: string;
}

export interface CreatePatientAllergyRequest {
  allergenName: string;
  allergyType: string;
  severity: string;
  reaction?: string;
  onsetDate?: string;
  notes?: string;
  isActive: boolean;
  patientId: number;
  recordedByUserId?: number;
}

export interface UpdatePatientAllergyRequest {
  allergenName?: string;
  allergyType?: string;
  severity?: string;
  reaction?: string;
  onsetDate?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ChronicCondition {
  id: number;
  conditionName: string;
  category?: string;
  diagnosisDate?: string;
  status?: string;
  treatment?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  patientId: number;
  patientName?: string;
  diagnosedByDoctorId?: number;
  diagnosedByDoctorName?: string;
  recordedByUserId?: number;
  recordedByUserName?: string;
}

export interface CreateChronicConditionRequest {
  conditionName: string;
  category?: string;
  diagnosisDate?: string;
  status?: string;
  treatment?: string;
  notes?: string;
  isActive: boolean;
  patientId: number;
  diagnosedByDoctorId?: number;
  recordedByUserId?: number;
}

export interface UpdateChronicConditionRequest {
  conditionName?: string;
  category?: string;
  diagnosisDate?: string;
  status?: string;
  treatment?: string;
  notes?: string;
  isActive?: boolean;
  diagnosedByDoctorId?: number;
}

export interface FamilyMedicalHistory {
  id: number;
  relationship: string;
  conditionName: string;
  category?: string;
  ageOfOnset?: string;
  status?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  patientId: number;
  patientName?: string;
  recordedByUserId?: number;
  recordedByUserName?: string;
}

export interface CreateFamilyMedicalHistoryRequest {
  relationship: string;
  conditionName: string;
  category?: string;
  ageOfOnset?: string;
  status?: string;
  notes?: string;
  patientId: number;
  recordedByUserId?: number;
}

export interface UpdateFamilyMedicalHistoryRequest {
  relationship?: string;
  conditionName?: string;
  category?: string;
  ageOfOnset?: string;
  status?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalHistoryService {
  private readonly allergiesUrl = `${API_CONFIG.baseUrl}/patientallergies`;
  private readonly conditionsUrl = `${API_CONFIG.baseUrl}/chronicconditions`;
  private readonly familyHistoryUrl = `${API_CONFIG.baseUrl}/familymedicalhistories`;

  constructor(private http: HttpClient) {}

  // Patient Allergies
  getAllAllergies(): Observable<PatientAllergy[]> {
    return this.http.get<PatientAllergy[]>(this.allergiesUrl);
  }

  getAllergyById(id: number): Observable<PatientAllergy> {
    return this.http.get<PatientAllergy>(`${this.allergiesUrl}/${id}`);
  }

  getAllergiesByPatient(patientId: number): Observable<PatientAllergy[]> {
    return this.http.get<PatientAllergy[]>(`${this.allergiesUrl}/patient/${patientId}`);
  }

  getActiveAllergiesByPatient(patientId: number): Observable<PatientAllergy[]> {
    return this.http.get<PatientAllergy[]>(`${this.allergiesUrl}/patient/${patientId}/active`);
  }

  createAllergy(payload: CreatePatientAllergyRequest): Observable<PatientAllergy> {
    return this.http.post<PatientAllergy>(this.allergiesUrl, payload);
  }

  updateAllergy(id: number, payload: UpdatePatientAllergyRequest): Observable<void> {
    return this.http.put<void>(`${this.allergiesUrl}/${id}`, payload);
  }

  deleteAllergy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.allergiesUrl}/${id}`);
  }

  // Chronic Conditions
  getAllConditions(): Observable<ChronicCondition[]> {
    return this.http.get<ChronicCondition[]>(this.conditionsUrl);
  }

  getConditionById(id: number): Observable<ChronicCondition> {
    return this.http.get<ChronicCondition>(`${this.conditionsUrl}/${id}`);
  }

  getConditionsByPatient(patientId: number): Observable<ChronicCondition[]> {
    return this.http.get<ChronicCondition[]>(`${this.conditionsUrl}/patient/${patientId}`);
  }

  getActiveConditionsByPatient(patientId: number): Observable<ChronicCondition[]> {
    return this.http.get<ChronicCondition[]>(`${this.conditionsUrl}/patient/${patientId}/active`);
  }

  createCondition(payload: CreateChronicConditionRequest): Observable<ChronicCondition> {
    return this.http.post<ChronicCondition>(this.conditionsUrl, payload);
  }

  updateCondition(id: number, payload: UpdateChronicConditionRequest): Observable<void> {
    return this.http.put<void>(`${this.conditionsUrl}/${id}`, payload);
  }

  deleteCondition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.conditionsUrl}/${id}`);
  }

  // Family Medical History
  getAllFamilyHistories(): Observable<FamilyMedicalHistory[]> {
    return this.http.get<FamilyMedicalHistory[]>(this.familyHistoryUrl);
  }

  getFamilyHistoryById(id: number): Observable<FamilyMedicalHistory> {
    return this.http.get<FamilyMedicalHistory>(`${this.familyHistoryUrl}/${id}`);
  }

  getFamilyHistoriesByPatient(patientId: number): Observable<FamilyMedicalHistory[]> {
    return this.http.get<FamilyMedicalHistory[]>(`${this.familyHistoryUrl}/patient/${patientId}`);
  }

  createFamilyHistory(payload: CreateFamilyMedicalHistoryRequest): Observable<FamilyMedicalHistory> {
    return this.http.post<FamilyMedicalHistory>(this.familyHistoryUrl, payload);
  }

  updateFamilyHistory(id: number, payload: UpdateFamilyMedicalHistoryRequest): Observable<void> {
    return this.http.put<void>(`${this.familyHistoryUrl}/${id}`, payload);
  }

  deleteFamilyHistory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.familyHistoryUrl}/${id}`);
  }
}

