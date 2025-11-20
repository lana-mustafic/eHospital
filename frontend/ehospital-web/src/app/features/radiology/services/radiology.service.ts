import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface ImagingStudy {
  id: number;
  studyDate: string;
  studyTime?: string;
  studyType: string; // X-Ray, CT Scan, MRI, Ultrasound, Mammography, etc.
  bodyPart?: string; // Chest, Abdomen, Head, etc.
  modality: string; // XR, CT, MR, US, MG, etc.
  description: string;
  status: string; // Ordered, Scheduled, In Progress, Completed, Cancelled
  priority: 'Routine' | 'Urgent' | 'STAT';
  patientId: number;
  patientName?: string;
  orderingPhysicianId: number;
  orderingPhysicianName?: string;
  performingPhysicianId?: number;
  performingPhysicianName?: string;
  radiologistId?: number;
  radiologistName?: string;
  medicalRecordId?: number;
  accessionNumber?: string; // Unique study identifier
  studyInstanceUid?: string; // DICOM Study Instance UID
  reportId?: number;
  hasImages: boolean;
  imageCount?: number;
  createdAt: string;
  completedDate?: string;
  reportDate?: string;
}

export interface RadiologyReport {
  id: number;
  imagingStudyId: number;
  reportDate: string;
  findings: string;
  impression: string;
  recommendations?: string;
  status: 'Draft' | 'Preliminary' | 'Final' | 'Amended';
  reportedBy?: string;
  reportedById?: number;
  reviewedBy?: string;
  reviewedById?: number;
  reviewedDate?: string;
  createdAt: string;
}

export interface DICOMImage {
  id: number;
  imagingStudyId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  seriesNumber?: number;
  instanceNumber?: number;
  sopInstanceUid?: string; // DICOM SOP Instance UID
  uploadedDate: string;
}

export interface CreateImagingStudyRequest {
  studyDate: string;
  studyTime?: string;
  studyType: string;
  bodyPart?: string;
  modality: string;
  description: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  patientId: number;
  orderingPhysicianId: number;
  medicalRecordId?: number;
  notes?: string;
}

export interface UpdateImagingStudyRequest {
  studyDate?: string;
  studyTime?: string;
  studyType?: string;
  bodyPart?: string;
  modality?: string;
  description?: string;
  status?: string;
  priority?: 'Routine' | 'Urgent' | 'STAT';
  performingPhysicianId?: number;
  radiologistId?: number;
  medicalRecordId?: number;
  accessionNumber?: string;
  studyInstanceUid?: string;
  completedDate?: string;
  notes?: string;
}

export interface CreateRadiologyReportRequest {
  imagingStudyId: number;
  findings: string;
  impression: string;
  recommendations?: string;
  status: 'Draft' | 'Preliminary' | 'Final';
}

@Injectable({ providedIn: 'root' })
export class RadiologyService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/radiology`;

  constructor(private http: HttpClient) {}

  // Imaging Studies
  getAllStudies(): Observable<ImagingStudy[]> {
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/studies`);
  }

  getStudyById(id: number): Observable<ImagingStudy> {
    return this.http.get<ImagingStudy>(`${this.apiUrl}/studies/${id}`);
  }

  getStudiesByPatient(patientId: number): Observable<ImagingStudy[]> {
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/studies/patient/${patientId}`);
  }

  getStudiesByStatus(status: string): Observable<ImagingStudy[]> {
    return this.http.get<ImagingStudy[]>(`${this.apiUrl}/studies/status/${status}`);
  }

  createStudy(payload: CreateImagingStudyRequest): Observable<ImagingStudy> {
    return this.http.post<ImagingStudy>(`${this.apiUrl}/studies`, payload);
  }

  updateStudy(id: number, payload: UpdateImagingStudyRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/studies/${id}`, payload);
  }

  deleteStudy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/studies/${id}`);
  }

  // Generate accession number
  generateAccessionNumber(): Observable<{ accessionNumber: string }> {
    return this.http.get<{ accessionNumber: string }>(`${this.apiUrl}/studies/generate-accession`);
  }

  // Image Management
  uploadImage(studyId: number, file: File): Observable<{ message: string; imageId: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; imageId: number }>(`${this.apiUrl}/studies/${studyId}/images`, formData);
  }

  uploadDICOM(studyId: number, file: File): Observable<{ message: string; imageId: number; dicomMetadata?: any }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; imageId: number; dicomMetadata?: any }>(`${this.apiUrl}/studies/${studyId}/dicom`, formData);
  }

  getStudyImages(studyId: number): Observable<DICOMImage[]> {
    return this.http.get<DICOMImage[]>(`${this.apiUrl}/studies/${studyId}/images`);
  }

  getImageUrl(studyId: number, imageId: number): string {
    return `${this.apiUrl}/studies/${studyId}/images/${imageId}/view`;
  }

  downloadImage(studyId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/studies/${studyId}/images/${imageId}/download`, { responseType: 'blob' });
  }

  deleteImage(studyId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/studies/${studyId}/images/${imageId}`);
  }

  // Reports
  getReport(studyId: number): Observable<RadiologyReport> {
    return this.http.get<RadiologyReport>(`${this.apiUrl}/studies/${studyId}/report`);
  }

  createReport(studyId: number, payload: CreateRadiologyReportRequest): Observable<RadiologyReport> {
    return this.http.post<RadiologyReport>(`${this.apiUrl}/studies/${studyId}/report`, payload);
  }

  updateReport(reportId: number, payload: Partial<CreateRadiologyReportRequest>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}`, payload);
  }

  finalizeReport(reportId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/finalize`, {});
  }

  reviewReport(reportId: number, reviewedBy: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/review`, { reviewedBy });
  }

  // Generate PDF report
  generateReportPDF(studyId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/studies/${studyId}/report/pdf`, { responseType: 'blob' });
  }

  // Helper to generate accession number client-side
  static generateAccessionNumberString(studyId: number, patientId: number): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `IMG-${year}${month}${day}-${studyId}-${patientId}`.toUpperCase();
  }
}

