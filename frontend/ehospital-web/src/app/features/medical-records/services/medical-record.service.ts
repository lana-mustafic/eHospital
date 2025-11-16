import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName?: string;
  doctorName?: string;
  diagnosis?: string;
  notes?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.medicalRecords}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(this.apiUrl);
  }

  create(payload: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<MedicalRecord>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

