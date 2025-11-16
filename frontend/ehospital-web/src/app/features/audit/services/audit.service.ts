import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface AuditLog {
  id: number;
  timestampUtc: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.audit}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }
}

