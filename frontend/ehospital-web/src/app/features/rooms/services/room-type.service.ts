import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  RoomType,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest
} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roomTypes}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl);
  }

  getActive(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateRoomTypeRequest): Observable<RoomType> {
    return this.http.post<RoomType>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateRoomTypeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

