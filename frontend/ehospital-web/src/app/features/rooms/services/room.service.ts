import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomAvailability
} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  getAvailability(): Observable<RoomAvailability[]> {
    return this.http.get<RoomAvailability[]>(`${this.apiUrl}/availability`);
  }

  getAvailable(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/available`);
  }

  getByType(roomTypeId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/type/${roomTypeId}`);
  }

  getByDepartment(departmentId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  getByStatus(status: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/status/${status}`);
  }

  create(payload: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateRoomRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

