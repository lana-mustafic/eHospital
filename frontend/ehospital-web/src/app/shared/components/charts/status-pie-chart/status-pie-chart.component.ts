import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatusData {
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

@Component({
  selector: 'app-status-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pie-chart-container">
      <svg viewBox="0 0 200 200" class="pie-chart">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="40"
        />
        <circle
          *ngIf="scheduled > 0"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          [attr.stroke]="colors.scheduled"
          stroke-width="40"
          [attr.stroke-dasharray]="getDashArray(scheduled)"
          [attr.stroke-dashoffset]="getDashOffset('scheduled')"
          transform="rotate(-90 100 100)"
        />
        <circle
          *ngIf="completed > 0"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          [attr.stroke]="colors.completed"
          stroke-width="40"
          [attr.stroke-dasharray]="getDashArray(completed)"
          [attr.stroke-dashoffset]="getDashOffset('completed')"
          transform="rotate(-90 100 100)"
        />
        <circle
          *ngIf="cancelled > 0"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          [attr.stroke]="colors.cancelled"
          stroke-width="40"
          [attr.stroke-dasharray]="getDashArray(cancelled)"
          [attr.stroke-dashoffset]="getDashOffset('cancelled')"
          transform="rotate(-90 100 100)"
        />
        <circle
          *ngIf="noShow > 0"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          [attr.stroke]="colors.noShow"
          stroke-width="40"
          [attr.stroke-dasharray]="getDashArray(noShow)"
          [attr.stroke-dashoffset]="getDashOffset('noShow')"
          transform="rotate(-90 100 100)"
        />
        <text x="100" y="95" text-anchor="middle" class="chart-center-text">
          {{ total }}
        </text>
        <text x="100" y="110" text-anchor="middle" class="chart-center-label">
          Total
        </text>
      </svg>
      <div class="chart-legend">
        <div class="legend-item" *ngIf="scheduled > 0">
          <span class="legend-color" [style.background-color]="colors.scheduled"></span>
          <span class="legend-label">Scheduled: {{ scheduled }}</span>
        </div>
        <div class="legend-item" *ngIf="completed > 0">
          <span class="legend-color" [style.background-color]="colors.completed"></span>
          <span class="legend-label">Completed: {{ completed }}</span>
        </div>
        <div class="legend-item" *ngIf="cancelled > 0">
          <span class="legend-color" [style.background-color]="colors.cancelled"></span>
          <span class="legend-label">Cancelled: {{ cancelled }}</span>
        </div>
        <div class="legend-item" *ngIf="noShow > 0">
          <span class="legend-color" [style.background-color]="colors.noShow"></span>
          <span class="legend-label">No Show: {{ noShow }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pie-chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .pie-chart {
      width: 200px;
      height: 200px;
    }

    .chart-center-text {
      font-size: 24px;
      font-weight: 700;
      fill: #1f2937;
    }

    .chart-center-label {
      font-size: 12px;
      fill: #6b7280;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .legend-label {
      color: #374151;
    }
  `]
})
export class StatusPieChartComponent implements OnChanges {
  @Input() scheduled = 0;
  @Input() completed = 0;
  @Input() cancelled = 0;
  @Input() noShow = 0;

  colors = {
    scheduled: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    noShow: '#6b7280'
  };

  total = 0;
  circumference = 2 * Math.PI * 80; // r = 80

  ngOnChanges(changes: SimpleChanges): void {
    this.total = this.scheduled + this.completed + this.cancelled + this.noShow;
  }

  getDashArray(value: number): string {
    if (this.total === 0) return '0';
    const percentage = value / this.total;
    const dashLength = this.circumference * percentage;
    return `${dashLength} ${this.circumference}`;
  }

  getDashOffset(status: string): number {
    if (this.total === 0) return 0;
    
    let offset = 0;
    if (status === 'scheduled') {
      offset = 0;
    } else if (status === 'completed') {
      offset = this.circumference * (1 - this.scheduled / this.total);
    } else if (status === 'cancelled') {
      offset = this.circumference * (1 - (this.scheduled + this.completed) / this.total);
    } else if (status === 'noShow') {
      offset = this.circumference * (1 - (this.scheduled + this.completed + this.cancelled) / this.total);
    }
    return offset;
  }
}

