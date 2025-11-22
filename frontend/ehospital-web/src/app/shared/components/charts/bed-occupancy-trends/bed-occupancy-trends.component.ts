import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OccupancyData {
  date: string;
  occupied: number;
  available: number;
  total: number;
}

@Component({
  selector: 'app-bed-occupancy-trends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bed-occupancy-trends.component.html',
  styleUrls: ['./bed-occupancy-trends.component.scss']
})
export class BedOccupancyTrendsComponent implements OnChanges {
  @Input() data: OccupancyData[] = [];
  @Input() width = 700;
  @Input() height = 350;
  @Input() title = 'Bed Occupancy Trends';

  padding = { top: 20, right: 40, bottom: 60, left: 80 };
  chartWidth = 0;
  chartHeight = 0;
  maxValue = 0;
  occupiedPoints: string = '';
  availablePoints: string = '';
  gridLines: Array<{ y: number; value: number }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['width'] || changes['height']) {
      this.calculateChart();
    }
  }

  calculateChart() {
    if (!this.data || this.data.length === 0) {
      this.occupiedPoints = '';
      this.availablePoints = '';
      this.gridLines = [];
      return;
    }

    this.chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.height - this.padding.top - this.padding.bottom;
    this.maxValue = Math.max(...this.data.map(d => d.total), 1);

    // Calculate occupied line points
    const occupiedPoints = this.data.map((item, index) => {
      const x = this.padding.left + (index / (this.data.length - 1 || 1)) * this.chartWidth;
      const normalizedValue = item.occupied / this.maxValue;
      const y = this.padding.top + this.chartHeight - (normalizedValue * this.chartHeight);
      return `${x},${y}`;
    });
    this.occupiedPoints = occupiedPoints.join(' ');

    // Calculate available line points (stacked on top of occupied)
    const availablePoints = this.data.map((item, index) => {
      const x = this.padding.left + (index / (this.data.length - 1 || 1)) * this.chartWidth;
      const occupiedNormalized = item.occupied / this.maxValue;
      const availableNormalized = item.available / this.maxValue;
      const y = this.padding.top + this.chartHeight - (occupiedNormalized + availableNormalized) * this.chartHeight;
      return `${x},${y}`;
    });
    this.availablePoints = availablePoints.join(' ');

    // Calculate grid lines
    const gridLineCount = 5;
    this.gridLines = [];
    for (let i = 0; i <= gridLineCount; i++) {
      const y = this.padding.top + (i / gridLineCount) * this.chartHeight;
      const value = this.maxValue - (i / gridLineCount) * this.maxValue;
      this.gridLines.push({ y, value: Math.round(value) });
    }
  }

  getDataPointX(index: number): number {
    return this.padding.left + (index / (this.data.length - 1 || 1)) * this.chartWidth;
  }

  getDataPointY(value: number, isOccupied: boolean, index: number): number {
    const normalizedValue = value / this.maxValue;
    let y = this.padding.top + this.chartHeight - (normalizedValue * this.chartHeight);
    
    if (!isOccupied) {
      // Stack available on top of occupied
      const occupiedNormalized = this.data[index].occupied / this.maxValue;
      y = this.padding.top + this.chartHeight - (occupiedNormalized + normalizedValue) * this.chartHeight;
    }
    
    return y;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

