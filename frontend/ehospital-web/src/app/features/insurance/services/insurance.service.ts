import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  InsuranceProvider,
  CreateInsuranceProviderRequest,
  UpdateInsuranceProviderRequest,
  PatientInsurance,
  CreatePatientInsuranceRequest,
  UpdatePatientInsuranceRequest,
  VerifyInsuranceRequest,
  Claim,
  CreateClaimRequest,
  UpdateClaimRequest,
  SubmitClaimRequest,
  ClaimDenial,
  CreateClaimDenialRequest,
  ClaimPayment,
  CreateClaimPaymentRequest,
  PriorAuthorization,
  CreatePriorAuthorizationRequest,
  UpdatePriorAuthorizationRequest
} from '../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  private readonly providersUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.insuranceProviders}`;
  private readonly patientInsurancesUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.patientInsurances}`;
  private readonly claimsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.claims}`;
  private readonly priorAuthsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.priorAuthorizations}`;

  constructor(private http: HttpClient) {}

  // Insurance Providers
  getAllProviders(activeOnly: boolean = false): Observable<InsuranceProvider[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<InsuranceProvider[]>(this.providersUrl, { params });
  }

  getProviderById(id: number): Observable<InsuranceProvider> {
    return this.http.get<InsuranceProvider>(`${this.providersUrl}/${id}`);
  }

  createProvider(payload: CreateInsuranceProviderRequest): Observable<InsuranceProvider> {
    return this.http.post<InsuranceProvider>(this.providersUrl, payload);
  }

  updateProvider(id: number, payload: UpdateInsuranceProviderRequest): Observable<void> {
    return this.http.put<void>(`${this.providersUrl}/${id}`, payload);
  }

  deleteProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.providersUrl}/${id}`);
  }

  // Patient Insurances
  getAllPatientInsurances(): Observable<PatientInsurance[]> {
    return this.http.get<PatientInsurance[]>(this.patientInsurancesUrl);
  }

  getPatientInsuranceById(id: number): Observable<PatientInsurance> {
    return this.http.get<PatientInsurance>(`${this.patientInsurancesUrl}/${id}`);
  }

  getPatientInsurancesByPatient(patientId: number, activeOnly: boolean = false): Observable<PatientInsurance[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<PatientInsurance[]>(`${this.patientInsurancesUrl}/patient/${patientId}`, { params });
  }

  createPatientInsurance(payload: CreatePatientInsuranceRequest): Observable<PatientInsurance> {
    return this.http.post<PatientInsurance>(this.patientInsurancesUrl, payload);
  }

  updatePatientInsurance(id: number, payload: UpdatePatientInsuranceRequest): Observable<void> {
    return this.http.put<void>(`${this.patientInsurancesUrl}/${id}`, payload);
  }

  verifyInsurance(id: number, payload: VerifyInsuranceRequest): Observable<PatientInsurance> {
    return this.http.post<PatientInsurance>(`${this.patientInsurancesUrl}/${id}/verify`, payload);
  }

  deletePatientInsurance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.patientInsurancesUrl}/${id}`);
  }

  // Claims
  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.claimsUrl);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.claimsUrl}/${id}`);
  }

  getClaimsByPatient(patientId: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.claimsUrl}/patient/${patientId}`);
  }

  getClaimsByInvoice(invoiceId: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.claimsUrl}/invoice/${invoiceId}`);
  }

  getClaimsByStatus(status: string): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.claimsUrl}/status/${status}`);
  }

  createClaim(payload: CreateClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(this.claimsUrl, payload);
  }

  updateClaim(id: number, payload: UpdateClaimRequest): Observable<void> {
    return this.http.put<void>(`${this.claimsUrl}/${id}`, payload);
  }

  submitClaim(id: number, payload: SubmitClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(`${this.claimsUrl}/${id}/submit`, payload);
  }

  addDenial(claimId: number, payload: CreateClaimDenialRequest): Observable<ClaimDenial> {
    return this.http.post<ClaimDenial>(`${this.claimsUrl}/${claimId}/denial`, payload);
  }

  postPayment(claimId: number, payload: CreateClaimPaymentRequest): Observable<ClaimPayment> {
    return this.http.post<ClaimPayment>(`${this.claimsUrl}/${claimId}/payment`, payload);
  }

  getDenials(claimId: number): Observable<ClaimDenial[]> {
    return this.http.get<ClaimDenial[]>(`${this.claimsUrl}/${claimId}/denials`);
  }

  getPayments(claimId: number): Observable<ClaimPayment[]> {
    return this.http.get<ClaimPayment[]>(`${this.claimsUrl}/${claimId}/payments`);
  }

  deleteClaim(id: number): Observable<void> {
    return this.http.delete<void>(`${this.claimsUrl}/${id}`);
  }

  // Prior Authorizations
  getAllPriorAuthorizations(): Observable<PriorAuthorization[]> {
    return this.http.get<PriorAuthorization[]>(this.priorAuthsUrl);
  }

  getPriorAuthorizationById(id: number): Observable<PriorAuthorization> {
    return this.http.get<PriorAuthorization>(`${this.priorAuthsUrl}/${id}`);
  }

  getPriorAuthorizationsByPatient(patientId: number): Observable<PriorAuthorization[]> {
    return this.http.get<PriorAuthorization[]>(`${this.priorAuthsUrl}/patient/${patientId}`);
  }

  getPriorAuthorizationsByStatus(status: string): Observable<PriorAuthorization[]> {
    return this.http.get<PriorAuthorization[]>(`${this.priorAuthsUrl}/status/${status}`);
  }

  createPriorAuthorization(payload: CreatePriorAuthorizationRequest): Observable<PriorAuthorization> {
    return this.http.post<PriorAuthorization>(this.priorAuthsUrl, payload);
  }

  updatePriorAuthorization(id: number, payload: UpdatePriorAuthorizationRequest): Observable<void> {
    return this.http.put<void>(`${this.priorAuthsUrl}/${id}`, payload);
  }

  deletePriorAuthorization(id: number): Observable<void> {
    return this.http.delete<void>(`${this.priorAuthsUrl}/${id}`);
  }
}

