import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  RoomTransfer,
  CreateRoomTransferRequest
} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomTransferService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.roomTransfers}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoomTransfer[]> {
    return this.http.get<RoomTransfer[]>(this.apiUrl);
  }

  getById(id: number): Observable<RoomTransfer> {
    return this.http.get<RoomTransfer>(`${this.apiUrl}/${id}`);
  }

  getByAdmission(admissionId: number): Observable<RoomTransfer[]> {
    return this.http.get<RoomTransfer[]>(`${this.apiUrl}/admission/${admissionId}`);
  }

  getByRoom(roomId: number): Observable<RoomTransfer[]> {
    return this.http.get<RoomTransfer[]>(`${this.apiUrl}/room/${roomId}`);
  }

  create(payload: CreateRoomTransferRequest): Observable<RoomTransfer> {
    return this.http.post<RoomTransfer>(this.apiUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

