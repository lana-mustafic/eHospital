import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../patients/services/patient.service';
import { Patient } from '../../patients/models/patient.model';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.scss']
})
export class MyProfileComponent implements OnInit {
  me: Patient | null = null;
  isLoading = false;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.patientService.getMe().subscribe({
      next: (p) => { this.me = p; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}

