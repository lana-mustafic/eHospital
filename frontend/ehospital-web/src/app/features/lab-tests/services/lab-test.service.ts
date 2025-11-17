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
}

