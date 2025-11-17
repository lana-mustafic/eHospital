import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  sentViaEmail: boolean;
  sentViaSms: boolean;
  sentViaInApp: boolean;
  emailSentAt?: string;
  smsSentAt?: string;
  userId: number;
  userName?: string;
  createdByUserId?: number;
  createdByUserName?: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  expiresAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  userId: number;
  createdByUserId?: number;
  sendEmail: boolean;
  sendSms: boolean;
  sendInApp: boolean;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  userName?: string;
  emailEnabled: boolean;
  emailAppointmentReminders: boolean;
  emailLabResults: boolean;
  emailCriticalAlerts: boolean;
  emailSystemNotifications: boolean;
  smsEnabled: boolean;
  smsAppointmentReminders: boolean;
  smsLabResults: boolean;
  smsCriticalAlerts: boolean;
  smsSystemNotifications: boolean;
  inAppEnabled: boolean;
  inAppAppointmentReminders: boolean;
  inAppLabResults: boolean;
  inAppCriticalAlerts: boolean;
  inAppSystemNotifications: boolean;
  appointmentReminderHoursBefore: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateNotificationPreferenceRequest {
  emailEnabled?: boolean;
  emailAppointmentReminders?: boolean;
  emailLabResults?: boolean;
  emailCriticalAlerts?: boolean;
  emailSystemNotifications?: boolean;
  smsEnabled?: boolean;
  smsAppointmentReminders?: boolean;
  smsLabResults?: boolean;
  smsCriticalAlerts?: boolean;
  smsSystemNotifications?: boolean;
  inAppEnabled?: boolean;
  inAppAppointmentReminders?: boolean;
  inAppLabResults?: boolean;
  inAppCriticalAlerts?: boolean;
  inAppSystemNotifications?: boolean;
  appointmentReminderHoursBefore?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/notifications`;
  private readonly preferencesUrl = `${API_CONFIG.baseUrl}/notificationpreferences`;

  constructor(private http: HttpClient) {}

  getByUser(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUnreadByUser(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/user/${userId}/unread-count`);
  }

  getById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, payload);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/read-all`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Preferences
  getPreference(userId: number): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(`${this.preferencesUrl}/user/${userId}`);
  }

  updatePreference(userId: number, payload: UpdateNotificationPreferenceRequest): Observable<NotificationPreference> {
    return this.http.post<NotificationPreference>(`${this.preferencesUrl}/user/${userId}`, payload);
  }
}

