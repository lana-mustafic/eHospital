import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { StockMovement, CreateStockMovementRequest } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stockMovements}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(this.apiUrl);
  }

  getById(id: number): Observable<StockMovement> {
    return this.http.get<StockMovement>(`${this.apiUrl}/${id}`);
  }

  getByItem(inventoryItemId: number): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/item/${inventoryItemId}`);
  }

  getByType(movementType: string): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/type/${movementType}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/date-range`, {
      params: new HttpParams()
        .set('startDate', startDate)
        .set('endDate', endDate)
    });
  }

  create(payload: CreateStockMovementRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(this.apiUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

