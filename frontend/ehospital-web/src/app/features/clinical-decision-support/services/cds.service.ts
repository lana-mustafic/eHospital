import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import {
  DrugInteraction,
  ClinicalGuideline,
  ProtocolSuggestion,
  CriticalValueAlert,
  CDSDashboard,
  CheckInteractionRequest,
  CheckInteractionResponse,
  GetGuidelinesRequest,
  GetProtocolSuggestionsRequest
} from '../models/cds.model';

@Injectable({ providedIn: 'root' })
export class ClinicalDecisionSupportService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/clinicaldecisionsupport`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<CDSDashboard> {
    return this.http.get<CDSDashboard>(`${this.apiUrl}/dashboard`);
  }

  // Drug Interactions
  checkInteractions(request: CheckInteractionRequest): Observable<CheckInteractionResponse> {
    return this.http.post<CheckInteractionResponse>(`${this.apiUrl}/interactions/check`, request);
  }

  getAllInteractions(): Observable<DrugInteraction[]> {
    return this.http.get<DrugInteraction[]>(`${this.apiUrl}/interactions`);
  }

  getInteractionsByMedication(medicationId: number): Observable<DrugInteraction[]> {
    return this.http.get<DrugInteraction[]>(`${this.apiUrl}/interactions/medication/${medicationId}`);
  }

  getInteractionsByPatient(patientId: number): Observable<DrugInteraction[]> {
    return this.http.get<DrugInteraction[]>(`${this.apiUrl}/interactions/patient/${patientId}`);
  }

  // Clinical Guidelines
  getGuidelines(request?: GetGuidelinesRequest): Observable<ClinicalGuideline[]> {
    let params = new HttpParams();
    if (request?.condition) {
      params = params.set('condition', request.condition);
    }
    if (request?.category) {
      params = params.set('category', request.category);
    }
    if (request?.patientId) {
      params = params.set('patientId', request.patientId.toString());
    }
    return this.http.get<ClinicalGuideline[]>(`${this.apiUrl}/guidelines`, { params });
  }

  getGuidelineById(id: number): Observable<ClinicalGuideline> {
    return this.http.get<ClinicalGuideline>(`${this.apiUrl}/guidelines/${id}`);
  }

  // Protocol Suggestions
  getProtocolSuggestions(request: GetProtocolSuggestionsRequest): Observable<ProtocolSuggestion[]> {
    return this.http.post<ProtocolSuggestion[]>(`${this.apiUrl}/protocols/suggest`, request);
  }

  getAllProtocols(): Observable<ProtocolSuggestion[]> {
    return this.http.get<ProtocolSuggestion[]>(`${this.apiUrl}/protocols`);
  }

  // Critical Value Alerts
  getCriticalAlerts(): Observable<CriticalValueAlert[]> {
    return this.http.get<CriticalValueAlert[]>(`${this.apiUrl}/alerts/critical`);
  }

  getAlertsByPatient(patientId: number): Observable<CriticalValueAlert[]> {
    return this.http.get<CriticalValueAlert[]>(`${this.apiUrl}/alerts/patient/${patientId}`);
  }

  acknowledgeAlert(alertId: number, acknowledgedBy: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {
      acknowledgedBy
    });
  }

  // Reminders
  getReminders(patientId?: number): Observable<ClinicalGuideline[]> {
    let params = new HttpParams();
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    return this.http.get<ClinicalGuideline[]>(`${this.apiUrl}/reminders`, { params });
  }
}

