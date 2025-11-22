import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RevenueData {
  category: string;
  amount: number;
  color?: string;
}

@Component({
  selector: 'app-revenue-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue-pie-chart.component.html',
  styleUrls: ['./revenue-pie-chart.component.scss']
})
export class RevenuePieChartComponent implements OnChanges {
  @Input() data: RevenueData[] = [];
  @Input() width = 300;
  @Input() height = 300;
  @Input() title = 'Revenue Breakdown';
  @Input() showLegend = true;

  total = 0;
  centerX = 150;
  centerY = 150;
  radius = 100;
  circumference = 2 * Math.PI * 100;
  segments: Array<{
    category: string;
    amount: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
    color: string;
    path: string;
  }> = [];

  defaultColors = [
    '#14b8a6', // Teal
    '#0ea5e9', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4'  // Cyan
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.calculateSegments();
    }
  }

  calculateSegments() {
    if (!this.data || this.data.length === 0) {
      this.segments = [];
      this.total = 0;
      return;
    }

    this.total = this.data.reduce((sum, item) => sum + item.amount, 0);
    
    let currentAngle = -90; // Start at top
    
    this.segments = this.data.map((item, index) => {
      const percentage = (item.amount / this.total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const color = item.color || this.defaultColors[index % this.defaultColors.length];
      
      // Calculate path for pie segment
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = this.centerX + this.radius * Math.cos(startRad);
      const y1 = this.centerY + this.radius * Math.sin(startRad);
      const x2 = this.centerX + this.radius * Math.cos(endRad);
      const y2 = this.centerY + this.radius * Math.sin(endRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const path = `M ${this.centerX} ${this.centerY} L ${x1} ${y1} A ${this.radius} ${this.radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      currentAngle = endAngle;
      
      return {
        category: item.category,
        amount: item.amount,
        percentage,
        startAngle,
        endAngle,
        color,
        path
      };
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

