export interface InsuranceProvider {
  id: number;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  payerId?: string;
  contactPerson?: string;
  isActive: boolean;
}

export interface CreateInsuranceProviderRequest {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  payerId?: string;
  contactPerson?: string;
}

export interface UpdateInsuranceProviderRequest {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  payerId?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export interface PatientInsurance {
  id: number;
  policyNumber: string;
  groupNumber?: string;
  subscriberId?: string;
  subscriberName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  copayAmount?: string;
  deductible?: string;
  coinsurance?: string;
  coverageType?: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedByUserId?: number;
  verifiedByUserName?: string;
  verificationNotes?: string;
  patientId: number;
  patientName: string;
  insuranceProviderId: number;
  insuranceProviderName: string;
}

export interface CreatePatientInsuranceRequest {
  policyNumber: string;
  groupNumber?: string;
  subscriberId?: string;
  subscriberName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  copayAmount?: string;
  deductible?: string;
  coinsurance?: string;
  coverageType?: string;
  patientId: number;
  insuranceProviderId: number;
}

export interface UpdatePatientInsuranceRequest {
  policyNumber?: string;
  groupNumber?: string;
  subscriberId?: string;
  subscriberName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  copayAmount?: string;
  deductible?: string;
  coinsurance?: string;
  coverageType?: string;
  isActive?: boolean;
}

export interface VerifyInsuranceRequest {
  verifiedByUserId: number;
  verificationNotes?: string;
}

export interface Claim {
  id: number;
  claimNumber: string;
  externalClaimId?: string;
  serviceDate: string;
  submissionDate?: string;
  totalCharges: number;
  approvedAmount?: number;
  paidAmount?: number;
  patientResponsibility?: number;
  status: string;
  statusReason?: string;
  diagnosisCodes?: string;
  procedureCodes?: string;
  notes?: string;
  createdAt: string;
  invoiceId: number;
  invoiceNumber: string;
  patientInsuranceId: number;
  insuranceProviderName: string;
  patientId: number;
  patientName: string;
  submittedByUserId?: number;
  submittedByUserName?: string;
  denials: ClaimDenial[];
  payments: ClaimPayment[];
}

export interface CreateClaimRequest {
  serviceDate: string;
  invoiceId: number;
  patientInsuranceId: number;
  diagnosisCodes?: string;
  procedureCodes?: string;
  notes?: string;
  submittedByUserId?: number;
}

export interface UpdateClaimRequest {
  status?: string;
  statusReason?: string;
  approvedAmount?: number;
  paidAmount?: number;
  patientResponsibility?: number;
  externalClaimId?: string;
  notes?: string;
}

export interface SubmitClaimRequest {
  submittedByUserId: number;
  notes?: string;
}

export interface ClaimDenial {
  id: number;
  denialCode: string;
  denialReason: string;
  adjustmentCode?: string;
  deniedAmount: number;
  denialDate: string;
  status: string;
  appealNotes?: string;
  appealDate?: string;
  resolutionNotes?: string;
  claimId: number;
  resolvedByUserId?: number;
  resolvedByUserName?: string;
}

export interface CreateClaimDenialRequest {
  denialCode: string;
  denialReason: string;
  adjustmentCode?: string;
  deniedAmount: number;
  denialDate: string;
}

export interface ClaimPayment {
  id: number;
  paymentReference: string;
  paymentDate: string;
  amount: number;
  checkNumber?: string;
  eftReference?: string;
  notes?: string;
  createdAt: string;
  claimId: number;
  postedByUserId?: number;
  postedByUserName?: string;
}

export interface CreateClaimPaymentRequest {
  paymentReference: string;
  paymentDate: string;
  amount: number;
  checkNumber?: string;
  eftReference?: string;
  notes?: string;
  postedByUserId?: number;
}

export interface PriorAuthorization {
  id: number;
  authorizationNumber: string;
  requestNumber?: string;
  requestDate: string;
  approvalDate?: string;
  expirationDate?: string;
  status: string;
  serviceType?: string;
  serviceDescription?: string;
  diagnosisCode?: string;
  procedureCode?: string;
  requestedAmount?: number;
  approvedAmount?: number;
  units?: number;
  denialReason?: string;
  notes?: string;
  createdAt: string;
  patientInsuranceId: number;
  insuranceProviderName: string;
  patientId: number;
  patientName: string;
  relatedInvoiceId?: number;
  relatedInvoiceNumber?: string;
  relatedAppointmentId?: number;
  requestedByUserId?: number;
  requestedByUserName?: string;
}

export interface CreatePriorAuthorizationRequest {
  serviceType?: string;
  serviceDescription?: string;
  diagnosisCode?: string;
  procedureCode?: string;
  requestedAmount?: number;
  units?: number;
  patientInsuranceId: number;
  relatedInvoiceId?: number;
  relatedAppointmentId?: number;
  notes?: string;
  requestedByUserId?: number;
}

export interface UpdatePriorAuthorizationRequest {
  authorizationNumber?: string;
  approvalDate?: string;
  expirationDate?: string;
  status?: string;
  approvedAmount?: number;
  denialReason?: string;
  notes?: string;
}

