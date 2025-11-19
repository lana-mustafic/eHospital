import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { EDVisit, CreateEDVisitRequest, UpdateEDVisitRequest, TriageRequest, DischargeRequest, EDStatistics } from '../models/ed-visit.model';

@Injectable({
  providedIn: 'root'
})
export class EDVisitService {
  private apiUrl = `${API_CONFIG.baseUrl}/edvisits`;

  constructor(private http: HttpClient) { }

  getAllVisits(status?: string, priority?: string, startDate?: string, endDate?: string): Observable<EDVisit[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<EDVisit[]>(this.apiUrl, { params });
  }

  getActiveVisits(): Observable<EDVisit[]> {
    return this.http.get<EDVisit[]>(`${this.apiUrl}/active`);
  }

  getStatistics(): Observable<EDStatistics> {
    return this.http.get<EDStatistics>(`${this.apiUrl}/statistics`);
  }

  getVisitById(id: number): Observable<EDVisit> {
    return this.http.get<EDVisit>(`${this.apiUrl}/${id}`);
  }

  getVisitsByPatient(patientId: number): Observable<EDVisit[]> {
    return this.http.get<EDVisit[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  createVisit(request: CreateEDVisitRequest): Observable<EDVisit> {
    return this.http.post<EDVisit>(this.apiUrl, request);
  }

  updateVisit(id: number, request: UpdateEDVisitRequest): Observable<EDVisit> {
    return this.http.put<EDVisit>(`${this.apiUrl}/${id}`, request);
  }

  performTriage(id: number, request: TriageRequest): Observable<EDVisit> {
    return this.http.post<EDVisit>(`${this.apiUrl}/${id}/triage`, request);
  }

  startTreatment(id: number, doctorId: number): Observable<EDVisit> {
    return this.http.post<EDVisit>(`${this.apiUrl}/${id}/start-treatment`, doctorId);
  }

  dischargePatient(id: number, request: DischargeRequest): Observable<EDVisit> {
    return this.http.post<EDVisit>(`${this.apiUrl}/${id}/discharge`, request);
  }

  deleteVisit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

