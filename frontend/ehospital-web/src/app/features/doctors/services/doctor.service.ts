import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { CreateDoctorRequest, Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctors}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  getById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateDoctorRequest): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, payload);
  }

  getMe(): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/me`);
  }
}

