import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Queue, CreateQueueRequest, UpdateQueueStatusRequest, ReorderQueueRequest } from '../models/queue.model';
import { API_CONFIG } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private apiUrl = `${API_CONFIG.baseUrl}/queues`;

  constructor(private http: HttpClient) {}

  getAllQueues(doctorId?: number, date?: Date): Observable<Queue[]> {
    let params = new HttpParams();
    if (doctorId) {
      params = params.set('doctorId', doctorId.toString());
    }
    if (date) {
      params = params.set('date', date.toISOString().split('T')[0]);
    }
    return this.http.get<Queue[]>(this.apiUrl, { params });
  }

  getActiveQueues(): Observable<Queue[]> {
    return this.http.get<Queue[]>(`${this.apiUrl}/active`);
  }

  getQueuesByDoctor(doctorId: number, date?: Date): Observable<Queue[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date.toISOString().split('T')[0]);
    }
    return this.http.get<Queue[]>(`${this.apiUrl}/doctor/${doctorId}`, { params });
  }

  getQueueById(id: number): Observable<Queue> {
    return this.http.get<Queue>(`${this.apiUrl}/${id}`);
  }

  createQueue(queue: CreateQueueRequest): Observable<Queue> {
    return this.http.post<Queue>(this.apiUrl, queue);
  }

  updateQueueStatus(id: number, update: UpdateQueueStatusRequest): Observable<Queue> {
    return this.http.put<Queue>(`${this.apiUrl}/${id}/status`, update);
  }

  callNextPatient(doctorId: number): Observable<Queue> {
    return this.http.post<Queue>(`${this.apiUrl}/doctor/${doctorId}/call-next`, {});
  }

  reorderQueue(doctorId: number, reorder: ReorderQueueRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/doctor/${doctorId}/reorder`, reorder);
  }

  skipQueue(id: number): Observable<Queue> {
    return this.http.put<Queue>(`${this.apiUrl}/${id}/skip`, {});
  }

  deleteQueue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

