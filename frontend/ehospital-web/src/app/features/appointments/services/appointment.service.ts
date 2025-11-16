import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { Appointment, CreateAppointmentRequest, UpdateAppointmentStatusRequest } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointments}`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patient/me`);
  }

  getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, payload);
  }

  updateStatus(id: number, payload: UpdateAppointmentStatusRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, payload);
  }

  cancelMine(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  rescheduleMine(id: number, payload: { appointmentDate: string; startTime: string; endTime: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reschedule`, payload);
  }

  isAvailable(doctorId: number, date: string, startTime: string, endTime: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/availability/${doctorId}/${date}/${startTime}/${endTime}`);
  }
}

