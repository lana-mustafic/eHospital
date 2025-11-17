import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface Medication {
  id: number;
  name: string;
  description: string;
  dosage: string;
  form: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  prescriptionCount?: number;
}

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.medications}`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.apiUrl);
  }

  getById(id: number): Observable<Medication> {
    return this.http.get<Medication>(`${this.apiUrl}/${id}`);
  }

  create(medication: Partial<Medication>): Observable<Medication> {
    return this.http.post<Medication>(this.apiUrl, medication);
  }

  update(id: number, medication: Partial<Medication>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, medication);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

