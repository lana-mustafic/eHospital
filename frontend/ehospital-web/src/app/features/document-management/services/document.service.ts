import { Injectable } from '@angular/core';
import { Observable, of, delay, map, BehaviorSubject } from 'rxjs';
import { 
  Document, 
  DocumentTemplate, 
  DocumentVersion, 
  DocumentSignature,
  CreateDocumentRequest, 
  UpdateDocumentRequest, 
  DocumentSearchFilter,
  DocumentCategory,
  DocumentStatus,
  DocumentVisibility,
  SignatureStatus,
  SignatureType,
  FieldType
} from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documents: Document[] = [];
  private templates: DocumentTemplate[] = [];
  private versions: DocumentVersion[] = [];
  
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Document CRUD Operations
  getDocuments(filter?: DocumentSearchFilter): Observable<Document[]> {
    let filteredDocs = [...this.documents];

    if (filter) {
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.name.toLowerCase().includes(term) ||
          doc.description?.toLowerCase().includes(term) ||
          doc.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }

      if (filter.category) {
        filteredDocs = filteredDocs.filter(doc => doc.category === filter.category);
      }

      if (filter.status) {
        filteredDocs = filteredDocs.filter(doc => doc.status === filter.status);
      }

      if (filter.createdBy) {
        filteredDocs = filteredDocs.filter(doc => doc.createdBy === filter.createdBy);
      }

      if (filter.patientId) {
        filteredDocs = filteredDocs.filter(doc => doc.patientId === filter.patientId);
      }

      if (filter.departmentId) {
        filteredDocs = filteredDocs.filter(doc => doc.departmentId === filter.departmentId);
      }

      if (filter.requiresSignature !== undefined) {
        filteredDocs = filteredDocs.filter(doc => doc.requiresSignature === filter.requiresSignature);
      }

      if (filter.signatureStatus) {
        filteredDocs = filteredDocs.filter(doc => doc.signatureStatus === filter.signatureStatus);
      }

      if (filter.dateFrom) {
        filteredDocs = filteredDocs.filter(doc => new Date(doc.createdAt) >= filter.dateFrom!);
      }

      if (filter.dateTo) {
        filteredDocs = filteredDocs.filter(doc => new Date(doc.createdAt) <= filter.dateTo!);
      }
    }

    return of(filteredDocs).pipe(delay(300));
  }

  getDocument(id: string): Observable<Document | null> {
    const document = this.documents.find(doc => doc.id === id);
    return of(document || null).pipe(delay(200));
  }

  createDocument(request: CreateDocumentRequest, file: File): Observable<Document> {
    const newDocument: Document = {
      id: this.generateId(),
      name: request.name,
      originalName: file.name,
      description: request.description,
      fileType: file.type,
      fileSize: file.size,
      filePath: `/uploads/documents/${this.generateId()}_${file.name}`,
      category: request.category,
      tags: request.tags,
      version: 1,
      isLatestVersion: true,
      templateId: request.templateId,
      createdAt: new Date(),
      createdBy: 'current-user-id',
      createdByName: 'Current User',
      updatedAt: new Date(),
      updatedBy: 'current-user-id',
      updatedByName: 'Current User',
      visibility: request.visibility,
      permissions: [],
      status: DocumentStatus.ACTIVE,
      requiresSignature: request.requiresSignature,
      signatures: request.signers?.map((signer, index) => ({
        id: this.generateId(),
        documentId: '',
        signerName: signer.signerName,
        signerEmail: signer.signerEmail,
        signerRole: signer.signerRole,
        signatureType: SignatureType.ELECTRONIC,
        status: SignatureStatus.PENDING,
        order: signer.order
      })) || [],
      signatureStatus: request.requiresSignature ? SignatureStatus.PENDING : SignatureStatus.COMPLETED,
      patientId: request.patientId,
      appointmentId: request.appointmentId,
      departmentId: request.departmentId,
      expiryDate: request.expiryDate,
      isArchived: false,
      downloadCount: 0
    };

    // Update signature document IDs
    newDocument.signatures.forEach(sig => sig.documentId = newDocument.id);

    this.documents.unshift(newDocument);
    this.documentsSubject.next([...this.documents]);

    return of(newDocument).pipe(delay(500));
  }

  updateDocument(id: string, request: UpdateDocumentRequest): Observable<Document> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }

    const updatedDocument = {
      ...this.documents[index],
      ...request,
      updatedAt: new Date(),
      updatedBy: 'current-user-id',
      updatedByName: 'Current User'
    };

    this.documents[index] = updatedDocument;
    this.documentsSubject.next([...this.documents]);

    return of(updatedDocument).pipe(delay(300));
  }

  deleteDocument(id: string): Observable<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      return of(false);
    }

    this.documents.splice(index, 1);
    this.documentsSubject.next([...this.documents]);

    return of(true).pipe(delay(300));
  }

  // Document Versioning
  getDocumentVersions(documentId: string): Observable<DocumentVersion[]> {
    const versions = this.versions.filter(v => v.documentId === documentId);
    return of(versions).pipe(delay(200));
  }

  createDocumentVersion(documentId: string, file: File, changeLog: string): Observable<DocumentVersion> {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const newVersion: DocumentVersion = {
      id: this.generateId(),
      documentId: documentId,
      version: document.version + 1,
      name: file.name,
      fileSize: file.size,
      filePath: `/uploads/documents/versions/${this.generateId()}_${file.name}`,
      changeLog: changeLog,
      createdAt: new Date(),
      createdBy: 'current-user-id',
      createdByName: 'Current User'
    };

    // Update document to new version
    document.version = newVersion.version;
    document.filePath = newVersion.filePath;
    document.fileSize = newVersion.fileSize;
    document.updatedAt = new Date();

    this.versions.push(newVersion);
    this.documentsSubject.next([...this.documents]);

    return of(newVersion).pipe(delay(500));
  }

  // Document Templates
  getTemplates(): Observable<DocumentTemplate[]> {
    return of([...this.templates]).pipe(delay(200));
  }

  getTemplate(id: string): Observable<DocumentTemplate | null> {
    const template = this.templates.find(t => t.id === id);
    return of(template || null).pipe(delay(200));
  }

  createTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<DocumentTemplate> {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      createdBy: 'current-user-id',
      updatedAt: new Date(),
      updatedBy: 'current-user-id'
    };

    this.templates.push(newTemplate);
    return of(newTemplate).pipe(delay(300));
  }

  // Electronic Signatures
  signDocument(documentId: string, signatureId: string, signatureData: string): Observable<DocumentSignature> {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const signature = document.signatures.find(sig => sig.id === signatureId);
    if (!signature) {
      throw new Error('Signature not found');
    }

    signature.signatureData = signatureData;
    signature.signedAt = new Date();
    signature.status = SignatureStatus.COMPLETED;

    // Check if all signatures are completed
    const allSigned = document.signatures.every(sig => sig.status === SignatureStatus.COMPLETED);
    if (allSigned) {
      document.signatureStatus = SignatureStatus.COMPLETED;
      document.status = DocumentStatus.APPROVED;
    } else {
      document.signatureStatus = SignatureStatus.IN_PROGRESS;
    }

    this.documentsSubject.next([...this.documents]);

    return of(signature).pipe(delay(300));
  }

  rejectSignature(documentId: string, signatureId: string, reason: string): Observable<DocumentSignature> {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const signature = document.signatures.find(sig => sig.id === signatureId);
    if (!signature) {
      throw new Error('Signature not found');
    }

    signature.status = SignatureStatus.REJECTED;
    signature.reason = reason;
    document.signatureStatus = SignatureStatus.REJECTED;
    document.status = DocumentStatus.REJECTED;

    this.documentsSubject.next([...this.documents]);

    return of(signature).pipe(delay(300));
  }

  // File Operations
  downloadDocument(id: string): Observable<Blob> {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Increment download count
    document.downloadCount++;
    document.lastAccessedAt = new Date();

    // Simulate file download
    const blob = new Blob(['Mock file content'], { type: document.fileType });
    return of(blob).pipe(delay(500));
  }

  previewDocument(id: string): Observable<string> {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Return mock preview URL
    return of(`/api/documents/${id}/preview`).pipe(delay(300));
  }

  // Statistics
  getDocumentStats(): Observable<any> {
    const stats = {
      totalDocuments: this.documents.length,
      byCategory: this.getStatsByCategory(),
      byStatus: this.getStatsByStatus(),
      recentUploads: this.documents
        .filter(doc => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return new Date(doc.createdAt) > dayAgo;
        }).length,
      pendingSignatures: this.documents.filter(doc => 
        doc.requiresSignature && doc.signatureStatus === SignatureStatus.PENDING
      ).length,
      expiringDocuments: this.documents.filter(doc => {
        if (!doc.expiryDate) return false;
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return new Date(doc.expiryDate) <= weekFromNow;
      }).length
    };

    return of(stats).pipe(delay(200));
  }

  private getStatsByCategory(): any {
    const stats: any = {};
    Object.values(DocumentCategory).forEach(category => {
      stats[category] = this.documents.filter(doc => doc.category === category).length;
    });
    return stats;
  }

  private getStatsByStatus(): any {
    const stats: any = {};
    Object.values(DocumentStatus).forEach(status => {
      stats[status] = this.documents.filter(doc => doc.status === status).length;
    });
    return stats;
  }

  private generateId(): string {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeMockData(): void {
    // Mock documents
    this.documents = [
      {
        id: 'doc_1',
        name: 'Patient Consent Form - John Doe',
        originalName: 'consent_form_john_doe.pdf',
        description: 'Surgical consent form for appendectomy procedure',
        fileType: 'application/pdf',
        fileSize: 245760,
        filePath: '/uploads/documents/consent_form_john_doe.pdf',
        category: DocumentCategory.CONSENT_FORM,
        tags: ['consent', 'surgery', 'appendectomy'],
        version: 1,
        isLatestVersion: true,
        createdAt: new Date('2024-11-20'),
        createdBy: 'user_1',
        createdByName: 'Dr. Sarah Johnson',
        updatedAt: new Date('2024-11-20'),
        updatedBy: 'user_1',
        updatedByName: 'Dr. Sarah Johnson',
        visibility: DocumentVisibility.PATIENT_ONLY,
        permissions: [],
        status: DocumentStatus.PENDING_REVIEW,
        requiresSignature: true,
        signatures: [
          {
            id: 'sig_1',
            documentId: 'doc_1',
            signerName: 'John Doe',
            signerEmail: 'john.doe@email.com',
            signerRole: 'Patient',
            signatureType: SignatureType.ELECTRONIC,
            status: SignatureStatus.PENDING,
            order: 1
          },
          {
            id: 'sig_2',
            documentId: 'doc_1',
            signerName: 'Dr. Sarah Johnson',
            signerEmail: 'sarah.johnson@hospital.com',
            signerRole: 'Surgeon',
            signatureType: SignatureType.ELECTRONIC,
            status: SignatureStatus.PENDING,
            order: 2
          }
        ],
        signatureStatus: SignatureStatus.PENDING,
        patientId: 'patient_1',
        isArchived: false,
        downloadCount: 0
      },
      {
        id: 'doc_2',
        name: 'Lab Results - Blood Work',
        originalName: 'lab_results_blood_work.pdf',
        description: 'Complete blood count and metabolic panel results',
        fileType: 'application/pdf',
        fileSize: 156432,
        filePath: '/uploads/documents/lab_results_blood_work.pdf',
        category: DocumentCategory.LAB_RESULT,
        tags: ['lab', 'blood', 'results'],
        version: 1,
        isLatestVersion: true,
        createdAt: new Date('2024-11-19'),
        createdBy: 'user_2',
        createdByName: 'Lab Technician Mary',
        updatedAt: new Date('2024-11-19'),
        updatedBy: 'user_2',
        updatedByName: 'Lab Technician Mary',
        visibility: DocumentVisibility.DEPARTMENT,
        permissions: [],
        status: DocumentStatus.ACTIVE,
        requiresSignature: false,
        signatures: [],
        signatureStatus: SignatureStatus.COMPLETED,
        patientId: 'patient_2',
        departmentId: 'dept_lab',
        isArchived: false,
        downloadCount: 3
      }
    ];

    // Mock templates
    this.templates = [
      {
        id: 'template_1',
        name: 'Surgical Consent Form',
        description: 'Standard consent form for surgical procedures',
        category: DocumentCategory.CONSENT_FORM,
        templatePath: '/templates/surgical_consent.pdf',
        fields: [
          {
            id: 'field_1',
            name: 'patientName',
            label: 'Patient Name',
            type: FieldType.TEXT,
            required: true,
            position: { page: 1, x: 100, y: 200, width: 200, height: 30 }
          },
          {
            id: 'field_2',
            name: 'procedure',
            label: 'Procedure',
            type: FieldType.TEXT,
            required: true,
            position: { page: 1, x: 100, y: 250, width: 300, height: 30 }
          },
          {
            id: 'field_3',
            name: 'patientSignature',
            label: 'Patient Signature',
            type: FieldType.SIGNATURE,
            required: true,
            position: { page: 1, x: 100, y: 400, width: 200, height: 60 }
          }
        ],
        isActive: true,
        createdAt: new Date('2024-11-15'),
        createdBy: 'admin_1',
        updatedAt: new Date('2024-11-15'),
        updatedBy: 'admin_1'
      },
      {
        id: 'template_2',
        name: 'Discharge Summary',
        description: 'Patient discharge summary template',
        category: DocumentCategory.DISCHARGE_SUMMARY,
        templatePath: '/templates/discharge_summary.pdf',
        fields: [
          {
            id: 'field_4',
            name: 'patientName',
            label: 'Patient Name',
            type: FieldType.TEXT,
            required: true,
            position: { page: 1, x: 100, y: 150, width: 200, height: 30 }
          },
          {
            id: 'field_5',
            name: 'admissionDate',
            label: 'Admission Date',
            type: FieldType.DATE,
            required: true,
            position: { page: 1, x: 350, y: 150, width: 150, height: 30 }
          },
          {
            id: 'field_6',
            name: 'dischargeDate',
            label: 'Discharge Date',
            type: FieldType.DATE,
            required: true,
            position: { page: 1, x: 350, y: 200, width: 150, height: 30 }
          }
        ],
        isActive: true,
        createdAt: new Date('2024-11-10'),
        createdBy: 'admin_1',
        updatedAt: new Date('2024-11-10'),
        updatedBy: 'admin_1'
      }
    ];

    this.documentsSubject.next([...this.documents]);
  }
}
