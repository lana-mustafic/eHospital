import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DocumentService } from './services/document.service';
import { 
  Document, 
  DocumentTemplate, 
  DocumentSearchFilter, 
  DocumentCategory, 
  DocumentStatus, 
  DocumentVisibility,
  SignatureStatus 
} from './models/document.model';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss']
})
export class DocumentManagementComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  templates: DocumentTemplate[] = [];
  documentStats: any = {};
  
  // UI State
  activeTab = 'documents';
  isLoading = false;
  showUploadModal = false;
  showTemplateModal = false;
  showSignatureModal = false;
  selectedDocument: Document | null = null;
  
  // Forms
  searchForm!: FormGroup;
  uploadForm!: FormGroup;
  
  // File Upload
  selectedFiles: File[] = [];
  dragOver = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  // Enums for template
  DocumentCategory = DocumentCategory;
  DocumentStatus = DocumentStatus;
  DocumentVisibility = DocumentVisibility;
  SignatureStatus = SignatureStatus;
  Object = Object;

  constructor(
    private documentService: DocumentService,
    private fb: FormBuilder,
    public router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadTemplates();
    this.loadStats();
    
    // Subscribe to document changes
    const docSub = this.documentService.documents$.subscribe(documents => {
      this.documents = documents;
      this.applyFilters();
    });
    this.subscriptions.push(docSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeForms(): void {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      category: [''],
      status: [''],
      dateFrom: [''],
      dateTo: [''],
      requiresSignature: [''],
      signatureStatus: ['']
    });

    this.uploadForm = this.fb.group({
      name: [''],
      description: [''],
      category: [DocumentCategory.OTHER],
      tags: [''],
      visibility: [DocumentVisibility.DEPARTMENT],
      requiresSignature: [false],
      patientId: [''],
      departmentId: ['']
    });

    // Subscribe to search form changes
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // Data Loading
  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.filteredDocuments = documents;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
      }
    });
  }

  loadTemplates(): void {
    this.documentService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  loadStats(): void {
    this.documentService.getDocumentStats().subscribe({
      next: (stats) => {
        this.documentStats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  // Filtering
  applyFilters(): void {
    const filters = this.searchForm.value;
    const filter: DocumentSearchFilter = {};

    if (filters.searchTerm) filter.searchTerm = filters.searchTerm;
    if (filters.category) filter.category = filters.category;
    if (filters.status) filter.status = filters.status;
    if (filters.dateFrom) filter.dateFrom = new Date(filters.dateFrom);
    if (filters.dateTo) filter.dateTo = new Date(filters.dateTo);
    if (filters.requiresSignature !== '') filter.requiresSignature = filters.requiresSignature === 'true';
    if (filters.signatureStatus) filter.signatureStatus = filters.signatureStatus;

    this.documentService.getDocuments(filter).subscribe({
      next: (documents) => {
        this.filteredDocuments = documents;
      }
    });
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.filteredDocuments = this.documents;
  }

  // Tab Management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // File Upload
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = files;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.selectedFiles = files;
  }

  uploadDocuments(): void {
    if (this.selectedFiles.length === 0) return;

    const formData = this.uploadForm.value;
    
    this.selectedFiles.forEach((file, index) => {
      const request = {
        name: formData.name || file.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        visibility: formData.visibility,
        requiresSignature: formData.requiresSignature,
        patientId: formData.patientId || undefined,
        departmentId: formData.departmentId || undefined
      };

      this.documentService.createDocument(request, file).subscribe({
        next: (document) => {
          console.log('Document uploaded:', document);
          if (index === this.selectedFiles.length - 1) {
            this.closeUploadModal();
            this.loadDocuments();
          }
        },
        error: (error) => {
          console.error('Error uploading document:', error);
        }
      });
    });
  }

  // Modal Management
  openUploadModal(): void {
    this.showUploadModal = true;
    this.selectedFiles = [];
    this.uploadForm.reset({
      category: DocumentCategory.OTHER,
      visibility: DocumentVisibility.DEPARTMENT,
      requiresSignature: false
    });
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFiles = [];
  }

  openTemplateModal(): void {
    this.showTemplateModal = true;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
  }

  openSignatureModal(document: Document): void {
    this.selectedDocument = document;
    this.showSignatureModal = true;
  }

  closeSignatureModal(): void {
    this.showSignatureModal = false;
    this.selectedDocument = null;
  }

  // Document Actions
  viewDocument(document: Document): void {
    this.router.navigate(['/documents', document.id, 'view']);
  }

  editDocument(document: Document): void {
    this.router.navigate(['/documents', document.id, 'edit']);
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.originalName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
      }
    });
  }

  deleteDocument(document: Document): void {
    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
      this.documentService.deleteDocument(document.id).subscribe({
        next: () => {
          console.log('Document deleted');
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
        }
      });
    }
  }

  signDocument(document: Document): void {
    this.openSignatureModal(document);
  }

  // Template Actions
  createFromTemplate(template: DocumentTemplate): void {
    this.router.navigate(['/documents/create-from-template', template.id]);
  }

  editTemplate(template: DocumentTemplate): void {
    this.router.navigate(['/documents/templates', template.id, 'edit']);
  }

  // Utility Methods
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('word')) return 'description';
    if (fileType.includes('excel')) return 'table_chart';
    if (fileType.includes('powerpoint')) return 'slideshow';
    return 'insert_drive_file';
  }

  getStatusClass(status: DocumentStatus): string {
    const statusClasses: { [key: string]: string } = {
      [DocumentStatus.DRAFT]: 'status-draft',
      [DocumentStatus.ACTIVE]: 'status-active',
      [DocumentStatus.PENDING_REVIEW]: 'status-pending',
      [DocumentStatus.APPROVED]: 'status-approved',
      [DocumentStatus.REJECTED]: 'status-rejected',
      [DocumentStatus.ARCHIVED]: 'status-archived',
      [DocumentStatus.EXPIRED]: 'status-expired'
    };
    return statusClasses[status] || 'status-default';
  }

  getSignatureStatusClass(status: SignatureStatus): string {
    const statusClasses: { [key: string]: string } = {
      [SignatureStatus.PENDING]: 'signature-pending',
      [SignatureStatus.IN_PROGRESS]: 'signature-progress',
      [SignatureStatus.COMPLETED]: 'signature-completed',
      [SignatureStatus.REJECTED]: 'signature-rejected',
      [SignatureStatus.EXPIRED]: 'signature-expired'
    };
    return statusClasses[status] || 'signature-default';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryDisplayName(category: DocumentCategory): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusDisplayName(status: DocumentStatus): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getSignatureStatusDisplayName(status: SignatureStatus): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Statistics helpers
  getStatsEntries(): any[] {
    return Object.entries(this.documentStats.byCategory || {});
  }

  getStatusStatsEntries(): any[] {
    return Object.entries(this.documentStats.byStatus || {});
  }

  getCompletedSignaturesCount(doc: Document): number {
    return doc.signatures.filter(s => s.status === SignatureStatus.COMPLETED).length;
  }

  getTotalSignaturesCount(doc: Document): number {
    return doc.signatures.length;
  }
}
