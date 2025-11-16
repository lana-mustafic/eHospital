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
}

