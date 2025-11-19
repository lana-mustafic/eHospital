import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../patients/services/patient.service';
import { DoctorService } from '../../doctors/services/doctor.service';
import { Patient } from '../../patients/models/patient.model';
import { Doctor } from '../../doctors/models/doctor.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientHistoryTimelineComponent } from '../../patients/components/patient-history-timeline/patient-history-timeline.component';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PatientHistoryTimelineComponent],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.scss']
})
export class MyProfileComponent implements OnInit {
  me: Patient | Doctor | null = null;
  isLoading = false;
  form: FormGroup;
  isEdit = false;
  isDoctor = false;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      phoneNumber: ['', Validators.required],
      address: [''],
      emergencyContact: ['']
    });
  }

  ngOnInit(): void {
    this.isDoctor = this.authService.hasRole('Doctor');
    this.isLoading = true;
    
    if (this.isDoctor) {
      this.doctorService.getMe().subscribe({
        next: (d) => { this.me = d; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.patientService.getMe().subscribe({
        next: (p) => { this.me = p; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    }
  }

  startEdit() {
    if (!this.me) return;
    this.isEdit = true;
    if (this.isDoctor) {
      // For doctors, we might want to add editable fields later
      // For now, just show read-only profile
    } else {
      const patient = this.me as Patient;
      this.form.patchValue({
        phoneNumber: patient.phoneNumber,
        address: patient.address,
        emergencyContact: patient.emergencyContact
      });
    }
  }

  save() {
    if (!this.me || this.form.invalid) return;
    if (this.isDoctor) {
      // Doctor profile updates can be added later if needed
      this.isEdit = false;
      return;
    }
    const payload = {
      phoneNumber: this.form.value.phoneNumber,
      address: this.form.value.address,
      emergencyContact: this.form.value.emergencyContact
    };
    const patient = this.me as Patient;
    this.patientService.update(patient.id, payload as any).subscribe({
      next: () => {
        this.isEdit = false;
        this.patientService.getMe().subscribe({ next: p => this.me = p });
      }
    });
  }

  cancel() {
    this.isEdit = false;
  }

  get patient(): Patient | null {
    return this.isDoctor ? null : (this.me as Patient);
  }

  get doctor(): Doctor | null {
    return this.isDoctor ? (this.me as Doctor) : null;
  }
}

