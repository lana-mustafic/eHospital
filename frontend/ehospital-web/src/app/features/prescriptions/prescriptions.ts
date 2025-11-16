import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prescription, PrescriptionService } from './services/prescription.service';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescriptions.html',
  styleUrls: ['./prescriptions.scss']
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  isLoading = false;

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.prescriptionService.getAll().subscribe({
      next: (data) => { this.prescriptions = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}

