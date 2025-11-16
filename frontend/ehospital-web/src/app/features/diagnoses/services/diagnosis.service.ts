import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface Diagnosis {
  id: number;
  patientId: number;
  patientName?: string;
  doctorName?: string;
  condition: string;
  notes?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class DiagnosisService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagnoses}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(this.apiUrl);
  }

  create(payload: Partial<Diagnosis>): Observable<Diagnosis> {
    return this.http.post<Diagnosis>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<Diagnosis>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }
}

