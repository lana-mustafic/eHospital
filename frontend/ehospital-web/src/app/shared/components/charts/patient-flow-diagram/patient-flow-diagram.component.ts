import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FlowNode {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface FlowConnection {
  from: string;
  to: string;
  value: number;
}

@Component({
  selector: 'app-patient-flow-diagram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-flow-diagram.component.html',
  styleUrls: ['./patient-flow-diagram.component.scss']
})
export class PatientFlowDiagramComponent implements OnChanges {
  @Input() nodes: FlowNode[] = [];
  @Input() connections: FlowConnection[] = [];
  @Input() width = 800;
  @Input() height = 500;
  @Input() title = 'Patient Flow';

  nodePositions: Map<string, { x: number; y: number }> = new Map();
  connectionPaths: Array<{ path: string; value: number; from: string; to: string }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes'] || changes['connections'] || changes['width'] || changes['height']) {
      this.calculateLayout();
    }
  }

  calculateLayout() {
    if (!this.nodes || this.nodes.length === 0) {
      this.nodePositions.clear();
      this.connectionPaths = [];
      return;
    }

    // Calculate node positions in a flow layout
    const padding = 40;
    const nodeWidth = 120;
    const nodeHeight = 80;
    const horizontalSpacing = 200;
    const verticalSpacing = 150;

    // Group nodes by stage (assuming sequential flow)
    const stages: FlowNode[][] = [];
    const nodesPerStage = Math.ceil(Math.sqrt(this.nodes.length));
    
    this.nodes.forEach((node, index) => {
      const stageIndex = Math.floor(index / nodesPerStage);
      if (!stages[stageIndex]) {
        stages[stageIndex] = [];
      }
      stages[stageIndex].push(node);
    });

    // Position nodes
    stages.forEach((stage, stageIndex) => {
      const startX = padding + stageIndex * horizontalSpacing;
      const stageHeight = stage.length * (nodeHeight + verticalSpacing / stage.length);
      const startY = (this.height - stageHeight) / 2;

      stage.forEach((node, nodeIndex) => {
        const y = startY + nodeIndex * (stageHeight / stage.length) + nodeHeight / 2;
        this.nodePositions.set(node.id, { x: startX, y });
      });
    });

    // Calculate connection paths
    this.connectionPaths = this.connections.map(conn => {
      const fromPos = this.nodePositions.get(conn.from);
      const toPos = this.nodePositions.get(conn.to);
      
      if (!fromPos || !toPos) {
        return { path: '', value: 0, from: conn.from, to: conn.to };
      }

      // Create curved path
      const dx = toPos.x - fromPos.x;
      const controlPointX = fromPos.x + dx * 0.5;
      const controlPointY1 = fromPos.y;
      const controlPointY2 = toPos.y;
      
      const path = `M ${fromPos.x + 60} ${fromPos.y} C ${controlPointX} ${controlPointY1}, ${controlPointX} ${controlPointY2}, ${toPos.x - 60} ${toPos.y}`;
      
      return { path, value: conn.value, from: conn.from, to: conn.to };
    });
  }

  getNodePosition(nodeId: string): { x: number; y: number } {
    return this.nodePositions.get(nodeId) || { x: 0, y: 0 };
  }

  getNodeColor(node: FlowNode): string {
    return node.color || '#14b8a6';
  }

  getConnectionWidth(value: number): number {
    const maxValue = Math.max(...this.connections.map(c => c.value), 1);
    return Math.max(2, (value / maxValue) * 8);
  }
}

