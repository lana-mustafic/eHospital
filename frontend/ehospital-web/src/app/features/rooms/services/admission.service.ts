import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  Admission,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  DischargePatientRequest
} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.admissions}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Admission[]> {
    return this.http.get<Admission[]>(this.apiUrl);
  }

  getActive(): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Admission> {
    return this.http.get<Admission>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getActiveByPatient(patientId: number): Observable<Admission> {
    return this.http.get<Admission>(`${this.apiUrl}/patient/${patientId}/active`);
  }

  getByStatus(status: string): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/status/${status}`);
  }

  getByRoom(roomId: number): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/room/${roomId}`);
  }

  getByBed(bedId: number): Observable<Admission[]> {
    return this.http.get<Admission[]>(`${this.apiUrl}/bed/${bedId}`);
  }

  create(payload: CreateAdmissionRequest): Observable<Admission> {
    return this.http.post<Admission>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateAdmissionRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  discharge(id: number, payload: DischargePatientRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/discharge`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

