import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService, Notification } from '../../../features/notifications/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService, User } from '../../../core/services/auth';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-center.html',
  styleUrls: ['./notification-center.scss']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  criticalCount = 0;
  currentUser: User | null = null;
  isLoading = false;
  private pollingSubscription?: Subscription;
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.id) {
      this.loadNotifications();
      this.loadUnreadCount();
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadNotifications(): void {
    if (!this.currentUser?.id) return;
    
    this.isLoading = true;
    this.notificationService.getUnreadByUser(Number(this.currentUser.id)).subscribe({
      next: (data) => {
        const previousCriticalCount = this.criticalCount;
        this.notifications = data.sort((a, b) => {
          // Sort by priority: Critical > High > Normal > Low
          const priorityOrder: { [key: string]: number } = {
            'Critical': 4,
            'High': 3,
            'Normal': 2,
            'Low': 1
          };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        this.criticalCount = this.notifications.filter(n => 
          n.priority === 'Critical' || n.type === 'Critical'
        ).length;
        
        // Show toast for new critical notifications
        if (this.criticalCount > previousCriticalCount && previousCriticalCount > 0) {
          const newCritical = this.notifications.filter(n => 
            (n.priority === 'Critical' || n.type === 'Critical') && 
            new Date(n.createdAt).getTime() > Date.now() - 35000 // Within last 35 seconds
          );
          
          newCritical.forEach(notif => {
            this.toastService.critical(notif.message, notif.title);
          });
        }
        
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadUnreadCount(): void {
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

  startPolling(): void {
    this.stopPolling();
    
    this.pollingSubscription = interval(this.POLL_INTERVAL)
      .pipe(
        switchMap(() => {
          if (!this.currentUser?.id) return of(null);
          return this.notificationService.getUnreadCount(Number(this.currentUser.id)).pipe(
            catchError(() => of(null))
          );
        })
      )
      .subscribe({
        next: (data) => {
          if (data && data.count !== this.unreadCount) {
            const previousCount = this.unreadCount;
            this.unreadCount = data.count;
            
            // If count increased, reload notifications
            if (this.unreadCount > previousCount) {
              this.loadNotifications();
            }
          }
        }
      });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification.isRead) return;
    
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        this.loadUnreadCount();
        this.loadNotifications();
      },
      error: () => {
        this.toastService.error('Failed to mark notification as read');
      }
    });
  }

  markAllAsRead(): void {
    if (!this.currentUser?.id) return;
    
    this.notificationService.markAllAsRead(Number(this.currentUser.id)).subscribe({
      next: () => {
        this.toastService.success('All notifications marked as read');
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: () => {
        this.toastService.error('Failed to mark all notifications as read');
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'priority-critical';
      case 'High':
        return 'priority-high';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-normal';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Critical':
      case 'Error':
        return 'type-critical';
      case 'Warning':
        return 'type-warning';
      case 'Success':
        return 'type-success';
      default:
        return 'type-info';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'Critical':
      case 'Error':
        return 'error';
      case 'Warning':
        return 'warning';
      case 'Success':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  trackById(index: number, notification: Notification): number {
    return notification.id;
  }

  toggleCenter(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  closeCenter(): void {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notification-wrapper') || target.closest('.notification-dropdown');
    
    if (!clickedInside) {
      this.closeCenter();
    }
  }
}

