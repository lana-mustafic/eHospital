import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  LowStockAlert,
  ExpiringItems,
  AdjustStockRequest
} from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inventoryItems}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  getById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  getLowStock(): Observable<LowStockAlert[]> {
    return this.http.get<LowStockAlert[]>(`${this.apiUrl}/low-stock`);
  }

  getExpiring(daysAhead: number = 30): Observable<ExpiringItems[]> {
    return this.http.get<ExpiringItems[]>(`${this.apiUrl}/expiring`, {
      params: new HttpParams().set('daysAhead', daysAhead.toString())
    });
  }

  getOutOfStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/out-of-stock`);
  }

  getByCategory(category: string): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/category/${category}`);
  }

  search(term: string): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('term', term)
    });
  }

  create(payload: CreateInventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateInventoryItemRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  adjustStock(id: number, payload: AdjustStockRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/adjust-stock`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

