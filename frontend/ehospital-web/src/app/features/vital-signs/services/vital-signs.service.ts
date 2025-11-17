import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface VitalSigns {
  id: number;
  recordedDate: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  notes?: string;
  createdAt: string;
  patientId: number;
  patientName?: string;
  medicalRecordId?: number;
  recordedByUserId?: number;
  recordedByName?: string;
  bloodPressure?: string;
  bmiIfAvailable?: number;
}

export interface CreateVitalSignsRequest {
  recordedDate: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  notes?: string;
  patientId: number;
  medicalRecordId?: number;
}

export interface UpdateVitalSignsRequest {
  recordedDate?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  notes?: string;
  medicalRecordId?: number;
}

@Injectable({ providedIn: 'root' })
export class VitalSignsService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.vitalSigns}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(this.apiUrl);
  }

  getById(id: number): Observable<VitalSigns> {
    return this.http.get<VitalSigns>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByPatientAndDateRange(patientId: number, startDate: Date, endDate: Date): Observable<VitalSigns[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<VitalSigns[]>(`${this.apiUrl}/patient/${patientId}/date-range`, { params });
  }

  create(payload: CreateVitalSignsRequest): Observable<VitalSigns> {
    return this.http.post<VitalSigns>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateVitalSignsRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

