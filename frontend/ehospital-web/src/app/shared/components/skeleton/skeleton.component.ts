import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" [class]="type" [style.width]="width" [style.height]="height" [style.border-radius]="borderRadius">
      <div class="skeleton-shimmer"></div>
    </div>
  `,
  styles: [`
    .skeleton {
      position: relative;
      background: #e5e7eb;
      overflow: hidden;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .skeleton-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.6),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }

    .skeleton.text {
      height: 1em;
      border-radius: 4px;
    }

    .skeleton.title {
      height: 1.5em;
      border-radius: 4px;
    }

    .skeleton.avatar {
      border-radius: 50%;
    }

    .skeleton.button {
      border-radius: 6px;
    }

    .skeleton.table-row {
      height: 60px;
      border-radius: 4px;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'button' | 'table-row' | 'custom' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '1em';
  @Input() borderRadius: string = '4px';
}

