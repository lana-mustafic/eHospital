export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  settings: { [key: string]: any };
  lastSync?: Date;
  status: IntegrationStatus;
  errorMessage?: string;
}

export enum IntegrationType {
  LAB_SYSTEM = 'LAB_SYSTEM',
  INSURANCE_PORTAL = 'INSURANCE_PORTAL',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  EMAIL_SERVICE = 'EMAIL_SERVICE',
  SMS_SERVICE = 'SMS_SERVICE'
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  CONFIGURING = 'CONFIGURING'
}

// HL7/FHIR Lab Integration
export interface LabSystemConfig extends IntegrationConfig {
  type: IntegrationType.LAB_SYSTEM;
  settings: {
    endpoint: string;
    apiKey?: string;
    username?: string;
    password?: string;
    protocol: 'HL7' | 'FHIR';
    fhirVersion?: string;
    hl7Version?: string;
    facilityId: string;
    sendingApplication: string;
    sendingFacility: string;
    receivingApplication: string;
    receivingFacility: string;
  };
}

export interface LabOrder {
  id: string;
  patientId: string;
  orderNumber: string;
  tests: LabTest[];
  orderedBy: string;
  orderedDate: Date;
  status: LabOrderStatus;
  results?: LabResult[];
  notes?: string;
}

export interface LabTest {
  code: string;
  name: string;
  specimenType?: string;
  priority?: 'Routine' | 'Stat' | 'ASAP';
}

export interface LabResult {
  testCode: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'Final' | 'Preliminary' | 'Corrected';
  resultDate: Date;
  performedBy?: string;
}

export enum LabOrderStatus {
  ORDERED = 'ORDERED',
  COLLECTED = 'COLLECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Insurance Portal Integration
export interface InsurancePortalConfig extends IntegrationConfig {
  type: IntegrationType.INSURANCE_PORTAL;
  settings: {
    providerId: string;
    apiEndpoint: string;
    apiKey: string;
    apiSecret: string;
    supportedInsurances: string[];
    eligibilityCheckEnabled: boolean;
    claimSubmissionEnabled: boolean;
    preAuthorizationEnabled: boolean;
  };
}

export interface InsuranceEligibility {
  patientId: string;
  insuranceId: string;
  memberId: string;
  eligible: boolean;
  effectiveDate?: Date;
  expirationDate?: Date;
  coverageDetails?: {
    copay?: number;
    deductible?: number;
    coveragePercentage?: number;
    maxOutOfPocket?: number;
  };
  errorMessage?: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  insuranceId: string;
  claimNumber: string;
  serviceDate: Date;
  diagnosisCodes: string[];
  procedureCodes: string[];
  amount: number;
  status: ClaimStatus;
  submittedDate?: Date;
  responseDate?: Date;
  paymentAmount?: number;
}

export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  DENIED = 'DENIED'
}

// Payment Gateway Integration
export interface PaymentGatewayConfig extends IntegrationConfig {
  type: IntegrationType.PAYMENT_GATEWAY;
  settings: {
    provider: PaymentProvider;
    merchantId: string;
    apiKey: string;
    apiSecret: string;
    environment: 'sandbox' | 'production';
    webhookUrl?: string;
    supportedMethods: PaymentMethod[];
  };
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  SQUARE = 'SQUARE',
  AUTHORIZE_NET = 'AUTHORIZE_NET',
  CUSTOM = 'CUSTOM'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CASH = 'CASH'
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  failureReason?: string;
  metadata?: { [key: string]: any };
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

// Email/SMS Notification
export interface EmailServiceConfig extends IntegrationConfig {
  type: IntegrationType.EMAIL_SERVICE;
  settings: {
    provider: EmailProvider;
    apiKey: string;
    apiSecret?: string;
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    useTLS?: boolean;
  };
}

export interface SMSServiceConfig extends IntegrationConfig {
  type: IntegrationType.SMS_SERVICE;
  settings: {
    provider: SMSProvider;
    apiKey: string;
    apiSecret?: string;
    fromNumber: string;
    accountSid?: string;
    authToken?: string;
  };
}

export enum EmailProvider {
  SENDGRID = 'SENDGRID',
  MAILGUN = 'MAILGUN',
  AWS_SES = 'AWS_SES',
  SMTP = 'SMTP',
  CUSTOM = 'CUSTOM'
}

export enum SMSProvider {
  TWILIO = 'TWILIO',
  AWS_SNS = 'AWS_SNS',
  NEXMO = 'NEXMO',
  CUSTOM = 'CUSTOM'
}

export interface NotificationMessage {
  id: string;
  type: 'EMAIL' | 'SMS';
  recipient: string;
  subject?: string;
  body: string;
  status: NotificationStatus;
  sentDate?: Date;
  errorMessage?: string;
  metadata?: { [key: string]: any };
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED'
}

