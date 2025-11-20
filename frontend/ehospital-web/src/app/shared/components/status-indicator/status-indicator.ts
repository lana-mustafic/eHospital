import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'pending' | 'completed' | 'overdue' | 'cancelled' | 'urgent' | 'high' | 'normal' | 'low';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-indicator" [ngClass]="getStatusClass()">
      <span class="status-dot" *ngIf="showDot"></span>
      <span class="status-label" *ngIf="label">{{ label }}</span>
      <span class="material-icons status-icon" *ngIf="icon">{{ icon }}</span>
    </span>
  `,
  styles: [`
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid transparent;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-icon {
      font-size: 14px;
    }

    .status-label {
      font-size: 12px;
    }

    // Bed Status Colors
    &.status-available {
      background-color: #d1fae5;
      color: #065f46;
      border-color: #10b981;
      
      .status-dot {
        background-color: #10b981;
      }
    }

    &.status-occupied {
      background-color: #fee2e2;
      color: #991b1b;
      border-color: #ef4444;
      
      .status-dot {
        background-color: #ef4444;
      }
    }

    &.status-maintenance {
      background-color: #fef3c7;
      color: #92400e;
      border-color: #f59e0b;
      
      .status-dot {
        background-color: #f59e0b;
      }
    }

    &.status-reserved {
      background-color: #dbeafe;
      color: #1e40af;
      border-color: #3b82f6;
      
      .status-dot {
        background-color: #3b82f6;
      }
    }

    // Priority Colors
    &.status-urgent {
      background-color: #fee2e2;
      color: #991b1b;
      border-color: #ef4444;
      animation: pulse-urgent 2s infinite;
      
      .status-dot {
        background-color: #ef4444;
      }
    }

    &.status-high {
      background-color: #fed7aa;
      color: #9a3412;
      border-color: #ea580c;
      
      .status-dot {
        background-color: #ea580c;
      }
    }

    &.status-normal {
      background-color: #dbeafe;
      color: #1e40af;
      border-color: #3b82f6;
      
      .status-dot {
        background-color: #3b82f6;
      }
    }

    &.status-low {
      background-color: #e5e7eb;
      color: #4b5563;
      border-color: #9ca3af;
      
      .status-dot {
        background-color: #9ca3af;
      }
    }

    @keyframes pulse-urgent {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
      }
      50% {
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
      }
    }
  `]
})
export class StatusIndicatorComponent {
  @Input() status: StatusType = 'normal';
  @Input() label?: string;
  @Input() icon?: string;
  @Input() showDot = true;

  getStatusClass(): string {
    return `status-${this.status}`;
  }
}

