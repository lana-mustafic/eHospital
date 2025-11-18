import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  Bed,
  CreateBedRequest,
  UpdateBedRequest
} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class BedService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.beds}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bed[]> {
    return this.http.get<Bed[]>(this.apiUrl);
  }

  getById(id: number): Observable<Bed> {
    return this.http.get<Bed>(`${this.apiUrl}/${id}`);
  }

  getAvailable(): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/available`);
  }

  getByRoom(roomId: number): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/room/${roomId}`);
  }

  getAvailableByRoom(roomId: number): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/room/${roomId}/available`);
  }

  getByStatus(status: string): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/status/${status}`);
  }

  create(payload: CreateBedRequest): Observable<Bed> {
    return this.http.post<Bed>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateBedRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

