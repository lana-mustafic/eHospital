import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  IntegrationConfig,
  IntegrationType,
  IntegrationStatus,
  LabSystemConfig,
  LabOrder,
  LabOrderStatus,
  LabResult,
  InsurancePortalConfig,
  InsuranceEligibility,
  InsuranceClaim,
  ClaimStatus,
  PaymentGatewayConfig,
  Payment,
  PaymentStatus,
  PaymentMethod,
  EmailServiceConfig,
  SMSServiceConfig,
  NotificationMessage,
  NotificationStatus
} from '../models/integration.model';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private apiUrl = '/api/integrations';

  constructor(private http: HttpClient) {}

  // Generic Integration Management
  getIntegrations(): Observable<IntegrationConfig[]> {
    return this.http.get<IntegrationConfig[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  getIntegration(id: string): Observable<IntegrationConfig | null> {
    return this.http.get<IntegrationConfig>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  createIntegration(config: IntegrationConfig): Observable<IntegrationConfig> {
    return this.http.post<IntegrationConfig>(this.apiUrl, config);
  }

  updateIntegration(id: string, config: Partial<IntegrationConfig>): Observable<IntegrationConfig> {
    return this.http.put<IntegrationConfig>(`${this.apiUrl}/${id}`, config);
  }

  deleteIntegration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  testIntegration(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/test`, {});
  }

  // Lab System Integration (HL7/FHIR)
  getLabSystemConfig(): Observable<LabSystemConfig | null> {
    return this.getIntegrations().pipe(
      map(integrations => {
        const labConfig = integrations.find(
          i => i.type === IntegrationType.LAB_SYSTEM
        ) as LabSystemConfig | undefined;
        return labConfig || null;
      })
    );
  }

  sendLabOrder(order: LabOrder): Observable<{ success: boolean; orderId?: string; message?: string }> {
    return this.http.post<{ success: boolean; orderId?: string; message?: string }>(
      `${this.apiUrl}/lab/orders`,
      order
    );
  }

  getLabResults(orderId: string): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(`${this.apiUrl}/lab/orders/${orderId}/results`);
  }

  syncLabResults(): Observable<{ synced: number; errors: number }> {
    return this.http.post<{ synced: number; errors: number }>(
      `${this.apiUrl}/lab/sync`,
      {}
    );
  }

  // Insurance Portal Integration
  getInsurancePortalConfig(): Observable<InsurancePortalConfig | null> {
    return this.getIntegrations().pipe(
      map(integrations => {
        const insuranceConfig = integrations.find(
          i => i.type === IntegrationType.INSURANCE_PORTAL
        ) as InsurancePortalConfig | undefined;
        return insuranceConfig || null;
      })
    );
  }

  checkEligibility(
    patientId: string,
    insuranceId: string,
    memberId: string
  ): Observable<InsuranceEligibility> {
    return this.http.post<InsuranceEligibility>(
      `${this.apiUrl}/insurance/eligibility`,
      { patientId, insuranceId, memberId }
    );
  }

  submitClaim(claim: InsuranceClaim): Observable<{ success: boolean; claimNumber?: string; message?: string }> {
    return this.http.post<{ success: boolean; claimNumber?: string; message?: string }>(
      `${this.apiUrl}/insurance/claims`,
      claim
    );
  }

  getClaimStatus(claimId: string): Observable<InsuranceClaim> {
    return this.http.get<InsuranceClaim>(`${this.apiUrl}/insurance/claims/${claimId}`);
  }

  // Payment Gateway Integration
  getPaymentGatewayConfig(): Observable<PaymentGatewayConfig | null> {
    return this.getIntegrations().pipe(
      map(integrations => {
        const paymentConfig = integrations.find(
          i => i.type === IntegrationType.PAYMENT_GATEWAY
        ) as PaymentGatewayConfig | undefined;
        return paymentConfig || null;
      })
    );
  }

  processPayment(payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/process`, payment);
  }

  refundPayment(paymentId: string, amount?: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/${paymentId}/refund`, { amount });
  }

  getPaymentStatus(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}`);
  }

  // Email/SMS Notification Services
  getEmailServiceConfig(): Observable<EmailServiceConfig | null> {
    return this.getIntegrations().pipe(
      map(integrations => {
        const emailConfig = integrations.find(
          i => i.type === IntegrationType.EMAIL_SERVICE
        ) as EmailServiceConfig | undefined;
        return emailConfig || null;
      })
    );
  }

  getSMSServiceConfig(): Observable<SMSServiceConfig | null> {
    return this.getIntegrations().pipe(
      map(integrations => {
        const smsConfig = integrations.find(
          i => i.type === IntegrationType.SMS_SERVICE
        ) as SMSServiceConfig | undefined;
        return smsConfig || null;
      })
    );
  }

  sendEmail(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string
  ): Observable<NotificationMessage> {
    return this.http.post<NotificationMessage>(`${this.apiUrl}/notifications/email`, {
      to,
      subject,
      body,
      htmlBody
    });
  }

  sendSMS(to: string, message: string): Observable<NotificationMessage> {
    return this.http.post<NotificationMessage>(`${this.apiUrl}/notifications/sms`, {
      to,
      message
    });
  }

  getNotificationHistory(
    type?: 'EMAIL' | 'SMS',
    limit: number = 50
  ): Observable<NotificationMessage[]> {
    let params: { [key: string]: string } = { limit: limit.toString() };
    if (type) {
      params['type'] = type;
    }
    return this.http.get<NotificationMessage[]>(`${this.apiUrl}/notifications`, { params });
  }
}

