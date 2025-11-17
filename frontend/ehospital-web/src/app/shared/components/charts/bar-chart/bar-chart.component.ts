import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart-container">
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="bar-chart">
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

        <!-- Bars -->
        <g class="bars">
          <g
            *ngFor="let bar of bars; trackBy: trackByIndex"
            class="bar-group"
          >
            <rect
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              [attr.fill]="bar.color"
              class="bar"
              [attr.data-value]="bar.value"
            />
            <text
              [attr.x]="bar.x + bar.width / 2"
              [attr.y]="bar.y - 5"
              text-anchor="middle"
              class="value-text"
            >
              {{ bar.value }}
            </text>
          </g>
        </g>

        <!-- Labels -->
        <g class="labels">
          <text
            *ngFor="let bar of bars; trackBy: trackByIndex"
            [attr.x]="bar.x + bar.width / 2"
            [attr.y]="height - 10"
            text-anchor="middle"
            class="label-text"
          >
            {{ bar.label }}
          </text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .bar-chart-container {
      width: 100%;
      padding: 1rem;
    }

    .bar-chart {
      width: 100%;
      height: 250px;
    }

    .bar {
      transition: opacity 0.2s;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
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
export class BarChartComponent implements OnChanges {
  @Input() data: BarData[] = [];
  @Input() width = 600;
  @Input() height = 250;
  @Input() defaultColor = '#667eea';

  bars: Array<{ x: number; y: number; width: number; height: number; label: string; value: number; color: string }> = [];
  gridLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  padding = { top: 30, right: 20, bottom: 40, left: 40 };
  chartWidth = 0;
  chartHeight = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['width'] || changes['height']) {
      this.calculateChart();
    }
  }

  calculateChart(): void {
    if (!this.data || this.data.length === 0) {
      this.bars = [];
      this.gridLines = [];
      return;
    }

    this.chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.height - this.padding.top - this.padding.bottom;

    const maxValue = Math.max(...this.data.map(d => d.value), 1);
    const barWidth = this.chartWidth / this.data.length * 0.7;
    const barSpacing = this.chartWidth / this.data.length;

    // Calculate bars
    this.bars = this.data.map((item, index) => {
      const x = this.padding.left + index * barSpacing + (barSpacing - barWidth) / 2;
      const normalizedHeight = (item.value / maxValue) * this.chartHeight;
      const y = this.padding.top + this.chartHeight - normalizedHeight;
      return {
        x,
        y,
        width: barWidth,
        height: normalizedHeight,
        label: item.label,
        value: item.value,
        color: item.color || this.defaultColor
      };
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

  trackByIndex(index: number): number {
    return index;
  }
}

