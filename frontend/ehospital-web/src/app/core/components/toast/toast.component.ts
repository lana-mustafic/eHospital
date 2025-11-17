import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background-color: #4caf50;
      color: white;
    }

    .toast-error {
      background-color: #f44336;
      color: white;
    }

    .toast-info {
      background-color: #2196f3;
      color: white;
    }

    .toast-warning {
      background-color: #ff9800;
      color: white;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }
}

