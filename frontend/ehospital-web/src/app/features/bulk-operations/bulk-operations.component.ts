import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { BulkOperationsService, BulkOperation } from './bulk-operations.service';

@Component({
  selector: 'app-bulk-operations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss']
})
export class BulkOperationsComponent implements OnInit, OnDestroy {
  operations: BulkOperation[] = [];
  operationStats: any = {};
  activeTab: string = 'dashboard';
  
  // Forms for different bulk operations
  appointmentForm!: FormGroup;
  invoiceForm!: FormGroup;
  notificationForm!: FormGroup;
  statusUpdateForm!: FormGroup;

  // Mock data
  mockPatients: any[] = [];
  mockDoctors: any[] = [];
  mockAppointments: any[] = [];

  // Subscriptions
  private refreshSubscription?: Subscription;

  constructor(
    private bulkOpsService: BulkOperationsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadMockData();
    this.loadOperations();
    this.loadStats();

    // Auto-refresh every 2 seconds
    this.refreshSubscription = interval(2000).subscribe(() => {
      this.loadOperations();
      this.loadStats();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  initializeForms(): void {
    // Bulk Appointment Form
    this.appointmentForm = this.fb.group({
      patientIds: [[], Validators.required],
      doctorId: ['', Validators.required],
      appointmentType: ['', Validators.required],
      department: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      timeSlots: [[], Validators.required],
      duration: [30, [Validators.required, Validators.min(15)]],
      notes: ['']
    });

    // Bulk Invoice Form
    this.invoiceForm = this.fb.group({
      patientIds: [[], Validators.required],
      serviceType: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      dueDate: ['', Validators.required],
      description: ['', Validators.required],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      discountRate: [0, [Validators.min(0), Validators.max(100)]]
    });

    // Mass Notification Form
    this.notificationForm = this.fb.group({
      recipientIds: [[], Validators.required],
      recipientType: ['patient', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      type: ['info', Validators.required],
      channels: [['email'], Validators.required],
      scheduledAt: ['']
    });

    // Bulk Status Update Form
    this.statusUpdateForm = this.fb.group({
      entityType: ['appointment', Validators.required],
      entityIds: [[], Validators.required],
      newStatus: ['', Validators.required],
      reason: [''],
      notifyUsers: [true]
    });
  }

  loadMockData(): void {
    this.mockPatients = this.bulkOpsService.generateMockPatients(50);
    this.mockDoctors = this.bulkOpsService.generateMockDoctors();
    this.mockAppointments = this.bulkOpsService.generateMockAppointments(30);
  }

  loadOperations(): void {
    this.bulkOpsService.getBulkOperations().subscribe(operations => {
      this.operations = operations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }

  loadStats(): void {
    this.bulkOpsService.getOperationStats().subscribe(stats => {
      this.operationStats = stats;
    });
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Bulk Appointment Scheduling
  submitBulkAppointments(): void {
    if (this.appointmentForm.valid) {
      const formData = this.appointmentForm.value;
      const bulkData = {
        patientIds: formData.patientIds,
        doctorId: formData.doctorId,
        appointmentType: formData.appointmentType,
        department: formData.department,
        dateRange: {
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        },
        timeSlots: formData.timeSlots,
        duration: formData.duration,
        notes: formData.notes
      };

      this.bulkOpsService.bulkScheduleAppointments(bulkData).subscribe(operation => {
        console.log('Bulk appointment operation started:', operation);
        this.appointmentForm.reset();
        this.setActiveTab('dashboard');
      });
    }
  }

  // Batch Invoice Generation
  submitBulkInvoices(): void {
    if (this.invoiceForm.valid) {
      const formData = this.invoiceForm.value;
      const bulkData = {
        patientIds: formData.patientIds,
        serviceType: formData.serviceType,
        amount: formData.amount,
        dueDate: new Date(formData.dueDate),
        description: formData.description,
        taxRate: formData.taxRate,
        discountRate: formData.discountRate
      };

      this.bulkOpsService.bulkGenerateInvoices(bulkData).subscribe(operation => {
        console.log('Bulk invoice operation started:', operation);
        this.invoiceForm.reset();
        this.setActiveTab('dashboard');
      });
    }
  }

  // Mass Notifications
  submitBulkNotifications(): void {
    if (this.notificationForm.valid) {
      const formData = this.notificationForm.value;
      const bulkData = {
        recipientIds: formData.recipientIds,
        recipientType: formData.recipientType,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        channels: formData.channels,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined
      };

      this.bulkOpsService.bulkSendNotifications(bulkData).subscribe(operation => {
        console.log('Bulk notification operation started:', operation);
        this.notificationForm.reset();
        this.setActiveTab('dashboard');
      });
    }
  }

  // Bulk Status Updates
  submitBulkStatusUpdates(): void {
    if (this.statusUpdateForm.valid) {
      const formData = this.statusUpdateForm.value;
      const bulkData = {
        entityType: formData.entityType,
        entityIds: formData.entityIds,
        newStatus: formData.newStatus,
        reason: formData.reason,
        notifyUsers: formData.notifyUsers
      };

      this.bulkOpsService.bulkUpdateStatus(bulkData).subscribe(operation => {
        console.log('Bulk status update operation started:', operation);
        this.statusUpdateForm.reset();
        this.setActiveTab('dashboard');
      });
    }
  }

  // Operation management
  cancelOperation(operationId: string): void {
    this.bulkOpsService.cancelOperation(operationId).subscribe(success => {
      if (success) {
        console.log('Operation cancelled successfully');
        this.loadOperations();
      }
    });
  }

  deleteOperation(operationId: string): void {
    if (confirm('Are you sure you want to delete this operation?')) {
      this.bulkOpsService.deleteOperation(operationId).subscribe(success => {
        if (success) {
          console.log('Operation deleted successfully');
          this.loadOperations();
        }
      });
    }
  }

  // Helper methods
  getOperationStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'running': 'status-running',
      'completed': 'status-completed',
      'failed': 'status-failed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  }

  getOperationIcon(type: string): string {
    const typeIcons: { [key: string]: string } = {
      'appointment': '📅',
      'invoice': '💰',
      'notification': '📢',
      'status': '🔄'
    };
    return typeIcons[type] || '📋';
  }

  formatDuration(createdAt: Date, completedAt?: Date): string {
    const end = completedAt || new Date();
    const duration = end.getTime() - createdAt.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  // Form helper methods
  selectAllPatients(): void {
    const allPatientIds = this.mockPatients.map(p => p.id);
    this.appointmentForm.patchValue({ patientIds: allPatientIds });
    this.invoiceForm.patchValue({ patientIds: allPatientIds });
    this.notificationForm.patchValue({ recipientIds: allPatientIds });
  }

  selectAllAppointments(): void {
    const allAppointmentIds = this.mockAppointments.map(a => a.id);
    this.statusUpdateForm.patchValue({ entityIds: allAppointmentIds });
  }

  // Checkbox handlers for appointments
  onPatientCheckboxChange(event: any, patientId: string, formType: 'appointment' | 'invoice' | 'notification'): void {
    const isChecked = event.target.checked;
    let currentForm: any;
    let fieldName: string;

    switch (formType) {
      case 'appointment':
        currentForm = this.appointmentForm;
        fieldName = 'patientIds';
        break;
      case 'invoice':
        currentForm = this.invoiceForm;
        fieldName = 'patientIds';
        break;
      case 'notification':
        currentForm = this.notificationForm;
        fieldName = 'recipientIds';
        break;
    }

    const currentIds = currentForm.get(fieldName)?.value || [];
    let updatedIds: string[];

    if (isChecked) {
      updatedIds = [...currentIds, patientId];
    } else {
      updatedIds = currentIds.filter((id: string) => id !== patientId);
    }

    currentForm.patchValue({ [fieldName]: updatedIds });
  }

  onTimeSlotCheckboxChange(event: any, slot: string): void {
    const isChecked = event.target.checked;
    const currentSlots = this.appointmentForm.get('timeSlots')?.value || [];
    let updatedSlots: string[];

    if (isChecked) {
      updatedSlots = [...currentSlots, slot];
    } else {
      updatedSlots = currentSlots.filter((s: string) => s !== slot);
    }

    this.appointmentForm.patchValue({ timeSlots: updatedSlots });
  }

  onChannelCheckboxChange(event: any, channel: string): void {
    const isChecked = event.target.checked;
    const currentChannels = this.notificationForm.get('channels')?.value || [];
    let updatedChannels: string[];

    if (isChecked) {
      updatedChannels = [...currentChannels, channel];
    } else {
      updatedChannels = currentChannels.filter((c: string) => c !== channel);
    }

    this.notificationForm.patchValue({ channels: updatedChannels });
  }

  onEntityCheckboxChange(event: any, entityId: string): void {
    const isChecked = event.target.checked;
    const currentIds = this.statusUpdateForm.get('entityIds')?.value || [];
    let updatedIds: string[];

    if (isChecked) {
      updatedIds = [...currentIds, entityId];
    } else {
      updatedIds = currentIds.filter((id: string) => id !== entityId);
    }

    this.statusUpdateForm.patchValue({ entityIds: updatedIds });
  }

  getAvailableTimeSlots(): string[] {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
  }

  getAppointmentTypes(): string[] {
    return ['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Checkup'];
  }

  getDepartments(): string[] {
    return ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Internal Medicine'];
  }

  getServiceTypes(): string[] {
    return ['Consultation', 'Laboratory', 'Radiology', 'Surgery', 'Therapy', 'Medication'];
  }

  getNotificationChannels(): string[] {
    return ['email', 'sms', 'push', 'in-app'];
  }

  getEntityStatuses(entityType: string): string[] {
    const statusMap: { [key: string]: string[] } = {
      'appointment': ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      'patient': ['active', 'inactive', 'discharged'],
      'prescription': ['pending', 'approved', 'dispensed', 'completed'],
      'invoice': ['draft', 'sent', 'paid', 'overdue', 'cancelled']
    };
    return statusMap[entityType] || [];
  }
}
