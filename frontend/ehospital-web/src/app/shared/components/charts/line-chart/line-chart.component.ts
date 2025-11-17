import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DataPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="line-chart-container">
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="line-chart">
        <!-- Grid lines -->
        <g class="grid-lines">
          <line
            *ngFor="let line of gridLines; trackBy: trackByIndex"
            [attr.x1]="line.x1"
            [attr.y1]="line.y1"
            [attr.x2]="line.x2"
            [attr.y2]="line.y2"
            stroke="#e5e7eb"
            stroke-width="1"
          />
        </g>

        <!-- Chart line -->
        <polyline
          *ngIf="points.length > 0"
          [attr.points]="getPolylinePoints()"
          fill="none"
          [attr.stroke]="lineColor"
          stroke-width="3"
          class="chart-line"
        />

        <!-- Data points -->
        <g class="data-points">
          <circle
            *ngFor="let point of points; trackBy: trackByIndex"
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            r="5"
            [attr.fill]="lineColor"
            class="data-point"
          />
        </g>

        <!-- Labels -->
        <g class="labels">
          <text
            *ngFor="let point of points; trackBy: trackByIndex"
            [attr.x]="point.x"
            [attr.y]="height - 5"
            text-anchor="middle"
            class="label-text"
          >
            {{ point.label }}
          </text>
        </g>

        <!-- Value labels -->
        <g class="value-labels">
          <text
            *ngFor="let point of points; trackBy: trackByIndex"
            [attr.x]="point.x"
            [attr.y]="point.y - 10"
            text-anchor="middle"
            class="value-text"
          >
            {{ point.value }}
          </text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .line-chart-container {
      width: 100%;
      padding: 1rem;
    }

    .line-chart {
      width: 100%;
      height: 250px;
      overflow: visible;
    }

    .chart-line {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .data-point {
      cursor: pointer;
      transition: r 0.2s;

      &:hover {
        r: 7;
      }
    }

    .label-text {
      font-size: 12px;
      fill: #6b7280;
    }

    .value-text {
      font-size: 11px;
      fill: #374151;
      font-weight: 600;
    }
  `]
})
export class LineChartComponent implements OnChanges {
  @Input() data: DataPoint[] = [];
  @Input() width = 600;
  @Input() height = 250;
  @Input() lineColor = '#667eea';

  points: Array<{ x: number; y: number; label: string; value: number }> = [];
  gridLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  padding = { top: 20, right: 20, bottom: 40, left: 40 };
  chartWidth = 0;
  chartHeight = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['width'] || changes['height']) {
      this.calculateChart();
    }
  }

  calculateChart(): void {
    if (!this.data || this.data.length === 0) {
      this.points = [];
      this.gridLines = [];
      return;
    }

    this.chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.height - this.padding.top - this.padding.bottom;

    const maxValue = Math.max(...this.data.map(d => d.value), 1);
    const minValue = Math.min(...this.data.map(d => d.value), 0);
    const valueRange = maxValue - minValue || 1;

    // Calculate points
    this.points = this.data.map((item, index) => {
      const x = this.padding.left + (index / (this.data.length - 1 || 1)) * this.chartWidth;
      const normalizedValue = (item.value - minValue) / valueRange;
      const y = this.padding.top + this.chartHeight - (normalizedValue * this.chartHeight);
      return { x, y, label: item.label, value: item.value };
    });

    // Calculate grid lines (5 horizontal lines)
    this.gridLines = [];
    const gridLineCount = 5;
    for (let i = 0; i <= gridLineCount; i++) {
      const y = this.padding.top + (i / gridLineCount) * this.chartHeight;
      this.gridLines.push({
        x1: this.padding.left,
        y1: y,
        x2: this.padding.left + this.chartWidth,
        y2: y
      });
    }
  }

  getPolylinePoints(): string {
    return this.points.map(p => `${p.x},${p.y}`).join(' ');
  }

  trackByIndex(index: number): number {
    return index;
  }
}

