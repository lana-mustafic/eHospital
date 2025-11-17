import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  patientId: number;
  patientName?: string;
  appointmentId?: number;
  createdByUserId?: number;
  createdByUserName?: string;
  invoiceItems: InvoiceItem[];
  payments: Payment[];
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType?: string;
  relatedEntityId?: number;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  notes?: string;
  status: string;
  createdAt: string;
  invoiceId: number;
  processedByUserId?: number;
  processedByUserName?: string;
}

export interface CreateInvoiceRequest {
  invoiceDate: string;
  dueDate: string;
  taxAmount: number;
  discountAmount: number;
  notes?: string;
  patientId: number;
  appointmentId?: number;
  createdByUserId?: number;
  invoiceItems: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType?: string;
  relatedEntityId?: number;
}

export interface UpdateInvoiceRequest {
  dueDate?: string;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  status?: string;
}

export interface CreatePaymentRequest {
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  notes?: string;
  invoiceId: number;
  processedByUserId?: number;
}

export interface UpdatePaymentRequest {
  paymentDate?: string;
  amount?: number;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.invoices}`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  getByInvoiceNumber(invoiceNumber: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/number/${invoiceNumber}`);
  }

  getByPatient(patientId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByStatus(status: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/status/${status}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<Invoice[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Invoice[]>(`${this.apiUrl}/date-range`, { params });
  }

  create(payload: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateInvoiceRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  // Payment methods
  createPayment(payload: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments`, payload);
  }

  getPayment(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${id}`);
  }

  getPaymentsByInvoice(invoiceId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/${invoiceId}/payments`);
  }

  updatePayment(id: number, payload: UpdatePaymentRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/payments/${id}`, payload);
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payments/${id}`);
  }
}

