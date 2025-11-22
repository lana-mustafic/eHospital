import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeatmapData {
  department: string;
  utilization: number; // 0-100 percentage
  capacity: number;
  current: number;
}

@Component({
  selector: 'app-department-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-heatmap.component.html',
  styleUrls: ['./department-heatmap.component.scss']
})
export class DepartmentHeatmapComponent implements OnChanges {
  @Input() data: HeatmapData[] = [];
  @Input() width = 600;
  @Input() height = 400;
  @Input() title = 'Department Utilization';

  cellWidth = 0;
  cellHeight = 0;
  maxUtilization = 100;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['width'] || changes['height']) {
      this.calculateLayout();
    }
  }

  calculateLayout() {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const padding = { top: 60, right: 100, bottom: 60, left: 150 };
    const availableWidth = this.width - padding.left - padding.right;
    const availableHeight = this.height - padding.top - padding.bottom;
    
    this.cellWidth = availableWidth / this.data.length;
    this.cellHeight = availableHeight;
    this.maxUtilization = Math.max(...this.data.map(d => d.utilization), 100);
  }

  getCellColor(utilization: number): string {
    if (utilization >= 90) return '#dc2626'; // Critical - Red
    if (utilization >= 75) return '#f59e0b'; // High - Amber
    if (utilization >= 50) return '#fbbf24'; // Medium - Yellow
    if (utilization >= 25) return '#14b8a6'; // Good - Teal
    return '#d1fae5'; // Low - Light Green
  }

  getCellX(index: number): number {
    const padding = 150;
    return padding + index * this.cellWidth;
  }

  getCellY(): number {
    return 60;
  }

  getIntensity(utilization: number): number {
    return Math.min(utilization / this.maxUtilization, 1);
  }

  getLabelTransform(x: number, y: number): string {
    return `rotate(-45, ${x}, ${y})`;
  }
}

