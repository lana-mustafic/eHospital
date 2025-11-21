import { Component, ElementRef, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-pad-container">
      <div class="signature-header">
        <h4>Electronic Signature</h4>
        <p>Please sign in the box below</p>
      </div>
      
      <div class="signature-canvas-container">
        <canvas 
          #signatureCanvas
          width="500" 
          height="200"
          class="signature-canvas"
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()"
          (touchstart)="startDrawing($event)"
          (touchmove)="draw($event)"
          (touchend)="stopDrawing()">
        </canvas>
        
        <div class="signature-overlay" [class.active]="isDrawing">
          <span *ngIf="isEmpty" class="signature-placeholder">Sign here</span>
        </div>
      </div>
      
      <div class="signature-controls">
        <button class="btn-clear" (click)="clearSignature()">
          <span class="material-icons">clear</span>
          Clear
        </button>
        <button class="btn-save" (click)="saveSignature()" [disabled]="isEmpty">
          <span class="material-icons">save</span>
          Save Signature
        </button>
      </div>
      
      <div class="signature-info">
        <div class="info-item">
          <span class="material-icons">info</span>
          <span>Your signature will be legally binding</span>
        </div>
        <div class="info-item">
          <span class="material-icons">security</span>
          <span>Signature is encrypted and secure</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signature-pad-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .signature-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .signature-header h4 {
      color: #1a365d;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .signature-header p {
      color: #64748b;
      margin: 0;
    }
    
    .signature-canvas-container {
      position: relative;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      background: #fafafa;
      overflow: hidden;
    }
    
    .signature-canvas {
      display: block;
      cursor: crosshair;
      background: white;
      width: 100%;
      height: 200px;
    }
    
    .signature-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .signature-overlay.active {
      opacity: 0;
    }
    
    .signature-placeholder {
      color: #9ca3af;
      font-size: 1.125rem;
      font-style: italic;
    }
    
    .signature-controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    
    .btn-clear, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .btn-clear {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .btn-clear:hover {
      background: #fecaca;
      transform: translateY(-2px);
    }
    
    .btn-save {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    
    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .btn-save:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }
    
    .signature-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    
    .info-item .material-icons {
      font-size: 1rem;
      color: #3182ce;
    }
    
    @media (max-width: 768px) {
      .signature-canvas {
        height: 150px;
      }
      
      .signature-controls {
        flex-direction: column;
      }
    }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('signatureCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureSaved = new EventEmitter<string>();
  @Output() signatureCleared = new EventEmitter<void>();

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  public isDrawing = false;
  public isEmpty = true;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Set up canvas context
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Set canvas size
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Fill with white background
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    this.isEmpty = false;
    
    const coords = this.getCoordinates(event);
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    // Start a new path
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    
    event.preventDefault();
    
    const coords = this.getCoordinates(event);
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  stopDrawing(): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();
  }

  private getCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }

  clearSignature(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.isEmpty = true;
    this.signatureCleared.emit();
  }

  saveSignature(): void {
    if (this.isEmpty) return;
    
    // Convert canvas to base64 image
    const signatureData = this.canvas.toDataURL('image/png');
    this.signatureSaved.emit(signatureData);
  }

  getSignatureData(): string | null {
    if (this.isEmpty) return null;
    return this.canvas.toDataURL('image/png');
  }

  isSignatureEmpty(): boolean {
    return this.isEmpty;
  }

  // Method to load existing signature
  loadSignature(signatureData: string): void {
    const img = new Image();
    img.onload = () => {
      this.clearSignature();
      this.ctx.drawImage(img, 0, 0);
      this.isEmpty = false;
    };
    img.src = signatureData;
  }
}
