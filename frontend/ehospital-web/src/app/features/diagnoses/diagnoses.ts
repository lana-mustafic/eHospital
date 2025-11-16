import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Diagnosis, DiagnosisService } from './services/diagnosis.service';

@Component({
  selector: 'app-diagnoses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnoses.html',
  styleUrls: ['./diagnoses.scss']
})
export class DiagnosesComponent implements OnInit {
  diagnoses: Diagnosis[] = [];
  isLoading = false;

  constructor(private diagnosisService: DiagnosisService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.diagnosisService.getAll().subscribe({
      next: (data) => { this.diagnoses = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}

