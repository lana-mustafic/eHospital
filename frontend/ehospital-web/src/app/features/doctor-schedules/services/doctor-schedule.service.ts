import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface DoctorSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class DoctorScheduleService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctorSchedules}`;
  constructor(private http: HttpClient) {}

  getByDoctor(doctorId: number): Observable<DoctorSchedule[]> {
    return this.http.get<DoctorSchedule[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  create(payload: Partial<DoctorSchedule>): Observable<DoctorSchedule> {
    return this.http.post<DoctorSchedule>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<DoctorSchedule>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

