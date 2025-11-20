import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientSummaryService } from './services/patient-summary.service';
import { PatientSummary } from './models/patient-summary.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-summary.html',
  styleUrls: ['./patient-summary.scss']
})
export class PatientSummaryComponent implements OnInit {
  @Input() patientId?: number;
  summary: PatientSummary | null = null;
  isLoading = false;
  selectedVitalSign: 'bloodPressure' | 'temperature' | 'heartRate' | 'respiratoryRate' | 'weight' | 'oxygenSaturation' | 'bloodGlucose' = 'bloodPressure';
  vitalSignOptions: ('bloodPressure' | 'temperature' | 'heartRate' | 'respiratoryRate' | 'weight' | 'oxygenSaturation' | 'bloodGlucose')[] = [
    'bloodPressure',
    'temperature',
    'heartRate',
    'respiratoryRate',
    'weight',
    'oxygenSaturation',
    'bloodGlucose'
  ];

  constructor(
    private patientSummaryService: PatientSummaryService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.patientId || this.route.snapshot.params['id'];
    if (id) {
      this.loadPatientSummary(+id);
    } else {
      this.toastService.error('Patient ID is required');
      this.router.navigate(['/patients']);
    }
  }

  loadPatientSummary(patientId: number): void {
    this.isLoading = true;
    this.patientSummaryService.getPatientSummary(patientId).subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load patient summary');
        console.error('Error loading patient summary:', err);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'Mild': 'severity-mild',
      'Moderate': 'severity-moderate',
      'Severe': 'severity-severe',
      'Life-threatening': 'severity-critical'
    };
    return severityMap[severity] || 'severity-mild';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Scheduled': 'status-scheduled',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'No Show': 'status-no-show',
      'Pending': 'status-pending',
      'Verified': 'status-verified',
      'Dispensed': 'status-dispensed'
    };
    return statusMap[status] || 'status-default';
  }

  getFlagClass(flag?: string): string {
    if (!flag) return 'flag-normal';
    const flagMap: { [key: string]: string } = {
      'Normal': 'flag-normal',
      'High': 'flag-high',
      'Low': 'flag-low',
      'Critical': 'flag-critical'
    };
    return flagMap[flag] || 'flag-normal';
  }

  selectVitalSign(sign: 'bloodPressure' | 'temperature' | 'heartRate' | 'respiratoryRate' | 'weight' | 'oxygenSaturation' | 'bloodGlucose'): void {
    this.selectedVitalSign = sign;
  }

  getVitalSignButtonLabel(sign: string): string {
    const labels: { [key: string]: string } = {
      'bloodPressure': 'BP',
      'temperature': 'Temp',
      'heartRate': 'HR',
      'respiratoryRate': 'RR',
      'weight': 'Weight',
      'oxygenSaturation': 'SpO2',
      'bloodGlucose': 'Glucose'
    };
    return labels[sign] || sign.charAt(0).toUpperCase() + sign.slice(1);
  }

  getCurrentVitalSignData() {
    if (!this.summary) return [];
    return this.summary.vitalSignsTrend[this.selectedVitalSign];
  }

  getVitalSignLabel(): string {
    const labels: { [key: string]: string } = {
      'bloodPressure': 'Blood Pressure (mmHg)',
      'temperature': 'Temperature (°F)',
      'heartRate': 'Heart Rate (bpm)',
      'respiratoryRate': 'Respiratory Rate (rpm)',
      'weight': 'Weight (lbs)',
      'oxygenSaturation': 'Oxygen Saturation (%)',
      'bloodGlucose': 'Blood Glucose (mg/dL)'
    };
    return labels[this.selectedVitalSign] || this.selectedVitalSign;
  }

  getVitalSignMaxValue(): number {
    const data = this.getCurrentVitalSignData();
    if (data.length === 0) return 100;
    const max = Math.max(...data.map(d => d.value));
    return Math.ceil(max * 1.1); // Add 10% padding
  }

  getVitalSignMinValue(): number {
    const data = this.getCurrentVitalSignData();
    if (data.length === 0) return 0;
    const min = Math.min(...data.map(d => d.value));
    return Math.max(0, Math.floor(min * 0.9)); // Subtract 10% padding, but not below 0
  }

  getBarHeight(value: number): number {
    const data = this.getCurrentVitalSignData();
    if (data.length === 0) return 0;
    const max = this.getVitalSignMaxValue();
    const min = this.getVitalSignMinValue();
    const range = max - min;
    if (range === 0) return 50;
    return ((value - min) / range) * 100;
  }

  navigateToPatientList(): void {
    this.router.navigate(['/patients']);
  }

  navigateToMedicalRecord(): void {
    if (this.summary) {
      this.router.navigate(['/records'], { queryParams: { patientId: this.summary.patient.id } });
    }
  }

  navigateToTimeline(): void {
    if (this.summary) {
      this.router.navigate(['/patients', this.summary.patient.id, 'timeline']);
    }
  }
}

