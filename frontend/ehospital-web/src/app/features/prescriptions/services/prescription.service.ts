import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface Prescription {
  id: number;
  patientId: number;
  patientName?: string;
  doctorName?: string;
  medicationName: string;
  dosage: string;
  instructions?: string;
  issuedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.prescriptions}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(this.apiUrl);
  }

  create(payload: Partial<Prescription>): Observable<Prescription> {
    return this.http.post<Prescription>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<Prescription>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

