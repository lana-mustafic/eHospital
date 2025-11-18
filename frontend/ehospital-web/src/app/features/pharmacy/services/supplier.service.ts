import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.suppliers}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getActive(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateSupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateSupplierRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

