export interface Document {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string;
  category: DocumentCategory;
  tags: string[];
  version: number;
  isLatestVersion: boolean;
  parentDocumentId?: string;
  templateId?: string;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  updatedAt: Date;
  updatedBy: string;
  updatedByName: string;
  
  // Access Control
  visibility: DocumentVisibility;
  permissions: DocumentPermission[];
  
  // Status
  status: DocumentStatus;
  
  // Signatures
  requiresSignature: boolean;
  signatures: DocumentSignature[];
  signatureStatus: SignatureStatus;
  
  // Associations
  patientId?: string;
  appointmentId?: string;
  departmentId?: string;
  
  // Additional Properties
  expiryDate?: Date;
  isArchived: boolean;
  downloadCount: number;
  lastAccessedAt?: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  name: string;
  fileSize: number;
  filePath: string;
  changeLog: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  templatePath: string;
  thumbnailPath?: string;
  fields: TemplateField[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: FieldValidation;
  position: FieldPosition;
}

export interface FieldPosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface DocumentSignature {
  id: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signatureType: SignatureType;
  signatureData?: string; // Base64 encoded signature image
  signedAt?: Date;
  status: SignatureStatus;
  order: number;
  reason?: string;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface DocumentPermission {
  userId: string;
  userName: string;
  role: string;
  permissions: Permission[];
}

export interface CreateDocumentRequest {
  name: string;
  description?: string;
  category: DocumentCategory;
  tags: string[];
  visibility: DocumentVisibility;
  patientId?: string;
  appointmentId?: string;
  departmentId?: string;
  templateId?: string;
  requiresSignature: boolean;
  signers?: CreateSignatureRequest[];
  expiryDate?: Date;
}

export interface CreateSignatureRequest {
  signerName: string;
  signerEmail: string;
  signerRole: string;
  order: number;
}

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
  visibility?: DocumentVisibility;
  status?: DocumentStatus;
  expiryDate?: Date;
}

export interface DocumentSearchFilter {
  searchTerm?: string;
  category?: DocumentCategory;
  fileType?: string;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: DocumentStatus;
  patientId?: string;
  departmentId?: string;
  tags?: string[];
  requiresSignature?: boolean;
  signatureStatus?: SignatureStatus;
}

// Enums
export enum DocumentCategory {
  MEDICAL_RECORD = 'medical_record',
  LAB_RESULT = 'lab_result',
  PRESCRIPTION = 'prescription',
  CONSENT_FORM = 'consent_form',
  INSURANCE = 'insurance',
  IDENTIFICATION = 'identification',
  DISCHARGE_SUMMARY = 'discharge_summary',
  REFERRAL = 'referral',
  IMAGING = 'imaging',
  ADMINISTRATIVE = 'administrative',
  LEGAL = 'legal',
  OTHER = 'other'
}

export enum DocumentVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DEPARTMENT = 'department',
  PATIENT_ONLY = 'patient_only'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
  EXPIRED = 'expired'
}

export enum SignatureStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum SignatureType {
  ELECTRONIC = 'electronic',
  DIGITAL = 'digital',
  WET_SIGNATURE = 'wet_signature'
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  EMAIL = 'email',
  PHONE = 'phone',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SIGNATURE = 'signature'
}

export enum Permission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  DELETE = 'delete',
  SHARE = 'share',
  SIGN = 'sign'
}
