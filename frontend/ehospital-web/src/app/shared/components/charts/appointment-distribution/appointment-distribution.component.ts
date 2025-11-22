import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DistributionData {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-appointment-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-distribution.component.html',
  styleUrls: ['./appointment-distribution.component.scss']
})
export class AppointmentDistributionComponent implements OnChanges {
  @Input() data: DistributionData[] = [];
  @Input() width = 600;
  @Input() height = 300;
  @Input() title = 'Appointment Distribution';
  @Input() chartType: 'bar' | 'line' = 'bar';

  padding = { top: 20, right: 40, bottom: 60, left: 60 };
  chartWidth = 0;
  chartHeight = 0;
  maxValue = 0;
  bars: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    value: number;
    color: string;
  }> = [];
  linePoints: string = '';

  defaultColors = ['#14b8a6', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['width'] || changes['height'] || changes['chartType']) {
      this.calculateChart();
    }
  }

  calculateChart() {
    if (!this.data || this.data.length === 0) {
      this.bars = [];
      this.linePoints = '';
      return;
    }

    this.chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.height - this.padding.top - this.padding.bottom;
    this.maxValue = Math.max(...this.data.map(d => d.value), 1);

    if (this.chartType === 'bar') {
      const barWidth = (this.chartWidth / this.data.length) * 0.7;
      const barSpacing = this.chartWidth / this.data.length;

      this.bars = this.data.map((item, index) => {
        const x = this.padding.left + index * barSpacing + (barSpacing - barWidth) / 2;
        const normalizedHeight = (item.value / this.maxValue) * this.chartHeight;
        const y = this.padding.top + this.chartHeight - normalizedHeight;
        const color = item.color || this.defaultColors[index % this.defaultColors.length];

        return {
          x,
          y,
          width: barWidth,
          height: normalizedHeight,
          label: item.label,
          value: item.value,
          color
        };
      });
    } else {
      // Line chart points
      const points = this.data.map((item, index) => {
        const x = this.padding.left + (index / (this.data.length - 1 || 1)) * this.chartWidth;
        const normalizedValue = item.value / this.maxValue;
        const y = this.padding.top + this.chartHeight - (normalizedValue * this.chartHeight);
        return `${x},${y}`;
      });
      this.linePoints = points.join(' ');
    }
  }

  getGridLines(): Array<{ y: number; value: number }> {
    const gridLineCount = 5;
    const lines: Array<{ y: number; value: number }> = [];
    
    for (let i = 0; i <= gridLineCount; i++) {
      const y = this.padding.top + (i / gridLineCount) * this.chartHeight;
      const value = this.maxValue - (i / gridLineCount) * this.maxValue;
      lines.push({ y, value: Math.round(value) });
    }
    
    return lines;
  }
}

