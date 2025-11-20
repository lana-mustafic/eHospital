export interface DrugInteraction {
  id: number;
  medication1Id: number;
  medication1Name: string;
  medication2Id: number;
  medication2Name: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  description: string;
  management: string;
  clinicalSignificance: string;
}

export interface ClinicalGuideline {
  id: number;
  title: string;
  category: string;
  condition: string;
  description: string;
  recommendations: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  lastUpdated: string;
  applicableTo?: string[];
}

export interface ProtocolSuggestion {
  id: number;
  condition: string;
  protocolName: string;
  description: string;
  steps: ProtocolStep[];
  indications: string[];
  contraindications: string[];
  priority: 'Routine' | 'Urgent' | 'Critical';
}

export interface ProtocolStep {
  stepNumber: number;
  description: string;
  duration?: string;
  notes?: string;
}

export interface CriticalValueAlert {
  id: number;
  patientId: number;
  patientName: string;
  testName: string;
  testType: string;
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  severity: 'Warning' | 'Critical' | 'Life-threatening';
  alertMessage: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface CDSDashboard {
  activeInteractions: number;
  pendingAlerts: number;
  guidelinesAvailable: number;
  protocolsSuggested: number;
  recentAlerts: CriticalValueAlert[];
  recentInteractions: DrugInteraction[];
}

export interface CheckInteractionRequest {
  medicationIds: number[];
  patientId?: number;
}

export interface CheckInteractionResponse {
  hasInteractions: boolean;
  interactions: DrugInteraction[];
  alertMessage?: string;
}

export interface GetGuidelinesRequest {
  condition?: string;
  category?: string;
  patientId?: number;
}

export interface GetProtocolSuggestionsRequest {
  condition: string;
  patientId?: number;
  symptoms?: string[];
}

