import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { CreatePatientRequest, Patient, UpdatePatientRequest } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.patients}`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/me`);
  }

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdatePatientRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

