import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../patients/services/patient.service';
import { Patient } from '../../patients/models/patient.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.scss']
})
export class MyProfileComponent implements OnInit {
  me: Patient | null = null;
  isLoading = false;
  form: FormGroup;
  isEdit = false;

  constructor(private patientService: PatientService, private fb: FormBuilder) {
    this.form = this.fb.group({
      phoneNumber: ['', Validators.required],
      address: [''],
      emergencyContact: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.patientService.getMe().subscribe({
      next: (p) => { this.me = p; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  startEdit() {
    if (!this.me) return;
    this.isEdit = true;
    this.form.patchValue({
      phoneNumber: this.me.phoneNumber,
      address: this.me.address,
      emergencyContact: this.me.emergencyContact
    });
  }

  save() {
    if (!this.me || this.form.invalid) return;
    const payload = {
      phoneNumber: this.form.value.phoneNumber,
      address: this.form.value.address,
      emergencyContact: this.form.value.emergencyContact
    };
    this.patientService.update(this.me.id, payload as any).subscribe({
      next: () => {
        this.isEdit = false;
        this.patientService.getMe().subscribe({ next: p => this.me = p });
      }
    });
  }

  cancel() {
    this.isEdit = false;
  }
}

