import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { AuthService, User } from '../../core/services/auth';
import {
  NotificationService,
  Notification,
  NotificationPreference,
  UpdateNotificationPreferenceRequest
} from './services/notification.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  paginatedNotifications: Notification[] = [];
  currentUser: User | null = null;
  isLoading = false;
  searchTerm = '';
  categoryFilter: string | null = null;
  typeFilter: string | null = null;
  showOnlyUnread = false;
  showPreferencesModal = false;
  preferences: NotificationPreference | null = null;
  preferencesForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  unreadCount = 0;

  // Options
  categories = ['Appointment', 'LabResult', 'VitalSigns', 'System', 'General'];
  types = ['Info', 'Warning', 'Error', 'Success', 'Critical'];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.preferencesForm = this.fb.group({
      emailEnabled: [true],
      emailAppointmentReminders: [true],
      emailLabResults: [true],
      emailCriticalAlerts: [true],
      emailSystemNotifications: [true],
      smsEnabled: [false],
      smsAppointmentReminders: [false],
      smsLabResults: [false],
      smsCriticalAlerts: [true],
      smsSystemNotifications: [false],
      inAppEnabled: [true],
      inAppAppointmentReminders: [true],
      inAppLabResults: [true],
      inAppCriticalAlerts: [true],
      inAppSystemNotifications: [true],
      appointmentReminderHoursBefore: [24]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.id) {
      this.loadNotifications();
      this.loadPreferences();
      this.loadUnreadCount();
    }
  }

  loadNotifications() {
    if (!this.currentUser?.id) return;
    
    this.isLoading = true;
    this.notificationService.getByUser(Number(this.currentUser.id)).subscribe({
      next: (data) => {
        this.notifications = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load notifications');
      }
    });
  }

  loadUnreadCount() {
    if (!this.currentUser?.id) return;
    
    this.notificationService.getUnreadCount(Number(this.currentUser.id)).subscribe({
      next: (data) => {
        this.unreadCount = data.count;
      },
      error: () => {
        // Silently fail
      }
    });
  }

  loadPreferences() {
    if (!this.currentUser?.id) return;
    
    this.notificationService.getPreference(Number(this.currentUser.id)).subscribe({
      next: (data) => {
        this.preferences = data;
        this.preferencesForm.patchValue({
          emailEnabled: data.emailEnabled,
          emailAppointmentReminders: data.emailAppointmentReminders,
          emailLabResults: data.emailLabResults,
          emailCriticalAlerts: data.emailCriticalAlerts,
          emailSystemNotifications: data.emailSystemNotifications,
          smsEnabled: data.smsEnabled,
          smsAppointmentReminders: data.smsAppointmentReminders,
          smsLabResults: data.smsLabResults,
          smsCriticalAlerts: data.smsCriticalAlerts,
          smsSystemNotifications: data.smsSystemNotifications,
          inAppEnabled: data.inAppEnabled,
          inAppAppointmentReminders: data.inAppAppointmentReminders,
          inAppLabResults: data.inAppLabResults,
          inAppCriticalAlerts: data.inAppCriticalAlerts,
          inAppSystemNotifications: data.inAppSystemNotifications,
          appointmentReminderHoursBefore: data.appointmentReminderHoursBefore
        });
      },
      error: () => {
        // Preferences might not exist yet, that's okay
      }
    });
  }

  applyFilters() {
    let temp = this.notifications;

    if (this.showOnlyUnread) {
      temp = temp.filter(n => !n.isRead);
    }

    if (this.categoryFilter) {
      temp = temp.filter(n => n.category === this.categoryFilter);
    }

    if (this.typeFilter) {
      temp = temp.filter(n => n.type === this.typeFilter);
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(n =>
        n.title?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term)
      );
    }

    this.filteredNotifications = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedNotifications = this.filteredNotifications.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;
    
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        this.loadUnreadCount();
        this.applyFilters();
      },
      error: () => this.toastService.error('Failed to mark notification as read')
    });
  }

  markAllAsRead() {
    if (!this.currentUser?.id) return;
    
    this.notificationService.markAllAsRead(Number(this.currentUser.id)).subscribe({
      next: () => {
        this.toastService.success('All notifications marked as read');
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: () => this.toastService.error('Failed to mark all notifications as read')
    });
  }

  deleteNotification(id: number) {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Notification deleted');
          this.loadNotifications();
          this.loadUnreadCount();
        },
        error: () => this.toastService.error('Failed to delete notification')
      });
    }
  }

  openPreferencesModal() {
    this.showPreferencesModal = true;
  }

  savePreferences() {
    if (!this.currentUser?.id) return;
    
    const payload: UpdateNotificationPreferenceRequest = this.preferencesForm.value;
    this.notificationService.updatePreference(Number(this.currentUser.id), payload).subscribe({
      next: () => {
        this.toastService.success('Notification preferences updated');
        this.loadPreferences();
        this.closePreferencesModal();
      },
      error: () => this.toastService.error('Failed to update preferences')
    });
  }

  closePreferencesModal() {
    this.showPreferencesModal = false;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Critical':
      case 'Error':
        return 'critical';
      case 'Warning':
        return 'warning';
      case 'Success':
        return 'success';
      default:
        return 'info';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'critical';
      case 'High':
        return 'high';
      case 'Low':
        return 'low';
      default:
        return 'normal';
    }
  }
}

