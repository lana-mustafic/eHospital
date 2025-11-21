import { Injectable } from '@angular/core';
import { Observable, of, delay, map, switchMap, forkJoin } from 'rxjs';

export interface BulkOperation {
  id: string;
  type: 'appointment' | 'invoice' | 'notification' | 'status';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: Date;
  completedAt?: Date;
  errors?: string[];
}

export interface BulkAppointmentData {
  patientIds: string[];
  doctorId: string;
  appointmentType: string;
  department: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  timeSlots: string[];
  duration: number;
  notes?: string;
}

export interface BulkInvoiceData {
  patientIds: string[];
  serviceType: string;
  amount: number;
  dueDate: Date;
  description: string;
  taxRate: number;
  discountRate?: number;
}

export interface BulkNotificationData {
  recipientIds: string[];
  recipientType: 'patient' | 'staff' | 'doctor' | 'all';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  scheduledAt?: Date;
}

export interface BulkStatusUpdateData {
  entityType: 'appointment' | 'patient' | 'prescription' | 'invoice';
  entityIds: string[];
  newStatus: string;
  reason?: string;
  notifyUsers: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BulkOperationsService {
  private operations: BulkOperation[] = [];

  constructor() {}

  // Get all bulk operations
  getBulkOperations(): Observable<BulkOperation[]> {
    return of(this.operations);
  }

  // Get operation by ID
  getBulkOperation(id: string): Observable<BulkOperation | undefined> {
    return of(this.operations.find(op => op.id === id));
  }

  // Bulk Appointment Scheduling
  bulkScheduleAppointments(data: BulkAppointmentData): Observable<BulkOperation> {
    const operation: BulkOperation = {
      id: this.generateId(),
      type: 'appointment',
      title: 'Bulk Appointment Scheduling',
      description: `Scheduling appointments for ${data.patientIds.length} patients`,
      status: 'running',
      progress: 0,
      totalItems: data.patientIds.length,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      errors: []
    };

    this.operations.push(operation);

    // Simulate bulk processing
    return this.simulateBulkProcess(operation, data.patientIds.length).pipe(
      map(() => operation)
    );
  }

  // Batch Invoice Generation
  bulkGenerateInvoices(data: BulkInvoiceData): Observable<BulkOperation> {
    const operation: BulkOperation = {
      id: this.generateId(),
      type: 'invoice',
      title: 'Batch Invoice Generation',
      description: `Generating invoices for ${data.patientIds.length} patients`,
      status: 'running',
      progress: 0,
      totalItems: data.patientIds.length,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      errors: []
    };

    this.operations.push(operation);

    return this.simulateBulkProcess(operation, data.patientIds.length).pipe(
      map(() => operation)
    );
  }

  // Mass Notifications
  bulkSendNotifications(data: BulkNotificationData): Observable<BulkOperation> {
    const operation: BulkOperation = {
      id: this.generateId(),
      type: 'notification',
      title: 'Mass Notifications',
      description: `Sending notifications to ${data.recipientIds.length} recipients`,
      status: 'running',
      progress: 0,
      totalItems: data.recipientIds.length,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      errors: []
    };

    this.operations.push(operation);

    return this.simulateBulkProcess(operation, data.recipientIds.length).pipe(
      map(() => operation)
    );
  }

  // Bulk Status Updates
  bulkUpdateStatus(data: BulkStatusUpdateData): Observable<BulkOperation> {
    const operation: BulkOperation = {
      id: this.generateId(),
      type: 'status',
      title: 'Bulk Status Updates',
      description: `Updating status for ${data.entityIds.length} ${data.entityType}s`,
      status: 'running',
      progress: 0,
      totalItems: data.entityIds.length,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      errors: []
    };

    this.operations.push(operation);

    return this.simulateBulkProcess(operation, data.entityIds.length).pipe(
      map(() => operation)
    );
  }

  // Cancel operation
  cancelOperation(id: string): Observable<boolean> {
    const operation = this.operations.find(op => op.id === id);
    if (operation && operation.status === 'running') {
      operation.status = 'cancelled';
      return of(true);
    }
    return of(false);
  }

  // Delete operation
  deleteOperation(id: string): Observable<boolean> {
    const index = this.operations.findIndex(op => op.id === id);
    if (index !== -1) {
      this.operations.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Get operation statistics
  getOperationStats(): Observable<any> {
    const stats = {
      total: this.operations.length,
      running: this.operations.filter(op => op.status === 'running').length,
      completed: this.operations.filter(op => op.status === 'completed').length,
      failed: this.operations.filter(op => op.status === 'failed').length,
      cancelled: this.operations.filter(op => op.status === 'cancelled').length
    };
    return of(stats);
  }

  // Private helper methods
  private simulateBulkProcess(operation: BulkOperation, totalItems: number): Observable<void> {
    const processInterval = 500; // Process every 500ms
    const itemsPerBatch = Math.max(1, Math.floor(totalItems / 10)); // Process in 10 batches

    return new Observable(observer => {
      const interval = setInterval(() => {
        if (operation.status === 'cancelled') {
          clearInterval(interval);
          observer.complete();
          return;
        }

        operation.processedItems = Math.min(
          operation.processedItems + itemsPerBatch,
          totalItems
        );

        // Simulate some failures (5% failure rate)
        const newFailures = Math.floor(Math.random() * itemsPerBatch * 0.05);
        operation.failedItems += newFailures;
        operation.processedItems = Math.max(0, operation.processedItems - newFailures);

        operation.progress = Math.floor((operation.processedItems / totalItems) * 100);

        // Add some random errors
        if (newFailures > 0) {
          operation.errors = operation.errors || [];
          operation.errors.push(`Failed to process ${newFailures} items at ${new Date().toLocaleTimeString()}`);
        }

        if (operation.processedItems + operation.failedItems >= totalItems) {
          operation.status = operation.failedItems > totalItems * 0.1 ? 'failed' : 'completed';
          operation.completedAt = new Date();
          operation.progress = 100;
          clearInterval(interval);
          observer.complete();
        }
      }, processInterval);
    });
  }

  private generateId(): string {
    return 'bulk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Mock data generators for testing
  generateMockPatients(count: number): any[] {
    const patients = [];
    for (let i = 1; i <= count; i++) {
      patients.push({
        id: `patient_${i}`,
        name: `Patient ${i}`,
        email: `patient${i}@example.com`,
        phone: `(555) 000-${String(i).padStart(4, '0')}`
      });
    }
    return patients;
  }

  generateMockDoctors(): any[] {
    return [
      { id: 'doc_1', name: 'Dr. Smith', department: 'Cardiology' },
      { id: 'doc_2', name: 'Dr. Johnson', department: 'Neurology' },
      { id: 'doc_3', name: 'Dr. Williams', department: 'Orthopedics' },
      { id: 'doc_4', name: 'Dr. Brown', department: 'Pediatrics' },
      { id: 'doc_5', name: 'Dr. Davis', department: 'Internal Medicine' }
    ];
  }

  generateMockAppointments(count: number): any[] {
    const appointments = [];
    const statuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    
    for (let i = 1; i <= count; i++) {
      appointments.push({
        id: `apt_${i}`,
        patientName: `Patient ${i}`,
        doctorName: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][i % 5]}`,
        date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)),
        status: statuses[i % statuses.length],
        type: ['Consultation', 'Follow-up', 'Emergency', 'Surgery'][i % 4]
      });
    }
    return appointments;
  }
}
