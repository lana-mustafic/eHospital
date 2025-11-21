import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Document } from '../models/document.model';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-viewer" *ngIf="document">
      <div class="viewer-header">
        <div class="document-info">
          <h3>{{ document.name }}</h3>
          <p>{{ document.description }}</p>
        </div>
        <div class="viewer-actions">
          <button class="action-btn" (click)="downloadDocument()" title="Download">
            <span class="material-icons">download</span>
          </button>
          <button class="action-btn" (click)="printDocument()" title="Print">
            <span class="material-icons">print</span>
          </button>
          <button class="action-btn" (click)="closeViewer()" title="Close">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <div class="viewer-content">
        <div *ngIf="isImageFile()" class="image-viewer">
          <img [src]="document.filePath" [alt]="document.name" />
        </div>
        
        <div *ngIf="isPdfFile()" class="pdf-viewer">
          <iframe [src]="getPdfUrl()" width="100%" height="600px"></iframe>
        </div>
        
        <div *ngIf="isTextFile()" class="text-viewer">
          <pre>{{ documentContent }}</pre>
        </div>
        
        <div *ngIf="!isViewableFile()" class="unsupported-viewer">
          <div class="unsupported-icon">
            <span class="material-icons">description</span>
          </div>
          <h4>Preview not available</h4>
          <p>This file type cannot be previewed. Please download to view.</p>
          <button class="btn-primary" (click)="downloadDocument()">
            <span class="material-icons">download</span>
            Download File
          </button>
        </div>
      </div>
      
      <div class="viewer-metadata">
        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="label">File Type:</span>
            <span class="value">{{ document.fileType }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">File Size:</span>
            <span class="value">{{ formatFileSize(document.fileSize) }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Version:</span>
            <span class="value">v{{ document.version }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Created:</span>
            <span class="value">{{ formatDate(document.createdAt) }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Created By:</span>
            <span class="value">{{ document.createdByName }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Downloads:</span>
            <span class="value">{{ document.downloadCount }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-viewer {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .viewer-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #f8fafc;
    }
    
    .document-info h3 {
      color: #1a365d;
      margin-bottom: 0.25rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .document-info p {
      color: #64748b;
      margin: 0;
    }
    
    .viewer-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .action-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      background: #f1f5f9;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .action-btn:hover {
      background: #e2e8f0;
      color: #3182ce;
    }
    
    .viewer-content {
      padding: 1.5rem;
      min-height: 400px;
    }
    
    .image-viewer img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    .pdf-viewer iframe {
      border: none;
      border-radius: 8px;
    }
    
    .text-viewer pre {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
    }
    
    .unsupported-viewer {
      text-align: center;
      padding: 2rem;
    }
    
    .unsupported-icon .material-icons {
      font-size: 4rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }
    
    .unsupported-viewer h4 {
      color: #4a5568;
      margin-bottom: 0.5rem;
    }
    
    .unsupported-viewer p {
      color: #718096;
      margin-bottom: 2rem;
    }
    
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .viewer-metadata {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    
    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .metadata-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .metadata-item .label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }
    
    .metadata-item .value {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 600;
    }
  `]
})
export class DocumentViewerComponent {
  @Input() document: Document | null = null;
  @Output() download = new EventEmitter<Document>();
  @Output() close = new EventEmitter<void>();
  
  documentContent = '';

  isImageFile(): boolean {
    return this.document?.fileType.startsWith('image/') || false;
  }

  isPdfFile(): boolean {
    return this.document?.fileType === 'application/pdf' || false;
  }

  isTextFile(): boolean {
    const textTypes = ['text/', 'application/json', 'application/xml'];
    return textTypes.some(type => this.document?.fileType.startsWith(type)) || false;
  }

  isViewableFile(): boolean {
    return this.isImageFile() || this.isPdfFile() || this.isTextFile();
  }

  getPdfUrl(): string {
    return this.document?.filePath + '#toolbar=1&navpanes=1&scrollbar=1' || '';
  }

  downloadDocument(): void {
    if (this.document) {
      this.download.emit(this.document);
    }
  }

  printDocument(): void {
    window.print();
  }

  closeViewer(): void {
    this.close.emit();
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
}
