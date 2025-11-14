import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { CreateDepartmentRequest, Department, UpdateDepartmentRequest } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.departments}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateDepartmentRequest): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateDepartmentRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

