import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface LabTest {
  id: number;
  orderedDate: string;
  completedDate?: string;
  testName: string;
  testType: string;
  testCode?: string;
  status: string;
  results?: string;
  notes?: string;
  filePath?: string;
  fileName?: string;
  fileContentType?: string;
  createdAt: string;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  medicalRecordId?: number;
  performedByUserId?: number;
  performedByName?: string;
  hasFile?: boolean;
  // Enhanced fields for Laboratory Management
  barcode?: string;
  specimenType?: string;
  specimenCollectedDate?: string;
  specimenCollectedBy?: string;
  resultValues?: LabResultValue[];
  isCritical?: boolean;
  reviewedBy?: string;
  reviewedDate?: string;
  priority?: 'Routine' | 'Urgent' | 'STAT';
}

export interface LabResultValue {
  parameter: string;
  value: string;
  unit?: string;
  normalRange?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface SpecimenInfo {
  specimenType: string;
  collectedDate: string;
  collectedBy: string;
  barcode: string;
}

export interface CreateLabTestRequest {
  orderedDate: string;
  testName: string;
  testType: string;
  testCode?: string;
  status: string;
  notes?: string;
  patientId: number;
  doctorId: number;
  medicalRecordId?: number;
  priority?: 'Routine' | 'Urgent' | 'STAT';
  specimenType?: string;
}

export interface UpdateLabTestRequest {
  completedDate?: string;
  testName?: string;
  testType?: string;
  testCode?: string;
  status?: string;
  results?: string;
  notes?: string;
  medicalRecordId?: number;
  performedByUserId?: number;
  barcode?: string;
  specimenType?: string;
  specimenCollectedDate?: string;
  specimenCollectedBy?: string;
  resultValues?: LabResultValue[];
  isCritical?: boolean;
  reviewedBy?: string;
  reviewedDate?: string;
  priority?: 'Routine' | 'Urgent' | 'STAT';
}

@Injectable({ providedIn: 'root' })
export class LabTestService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.labTests}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(this.apiUrl);
  }

  getById(id: number): Observable<LabTest> {
    return this.http.get<LabTest>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByDoctor(doctorId: number): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getByStatus(status: string): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(`${this.apiUrl}/status/${status}`);
  }

  getByPatientAndStatus(patientId: number, status: string): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(`${this.apiUrl}/patient/${patientId}/status/${status}`);
  }

  create(payload: CreateLabTestRequest): Observable<LabTest> {
    return this.http.post<LabTest>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateLabTestRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadFile(id: number, file: File): Observable<{ message: string; filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; filePath: string }>(`${this.apiUrl}/${id}/upload`, formData);
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  // Generate barcode for lab test
  generateBarcode(id: number): Observable<{ barcode: string }> {
    return this.http.post<{ barcode: string }>(`${this.apiUrl}/${id}/generate-barcode`, {});
  }

  // Update specimen collection info
  updateSpecimenInfo(id: number, specimenInfo: SpecimenInfo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/specimen`, specimenInfo);
  }

  // Submit lab results
  submitResults(id: number, results: { resultValues: LabResultValue[]; notes?: string; isCritical?: boolean }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/results`, results);
  }

  // Review results
  reviewResults(id: number, reviewedBy: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/review`, { reviewedBy });
  }

  // Get critical results
  getCriticalResults(): Observable<LabTest[]> {
    return this.http.get<LabTest[]>(`${this.apiUrl}/critical`);
  }

  // Generate barcode string (client-side helper)
  static generateBarcodeString(labTestId: number, patientId: number): string {
    const timestamp = Date.now().toString(36);
    return `LAB-${labTestId}-${patientId}-${timestamp}`.toUpperCase();
  }
}

