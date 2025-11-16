import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prescription, PrescriptionService } from './services/prescription.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prescriptions.html',
  styleUrls: ['./prescriptions.scss']
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  isLoading = false;
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;

  constructor(private prescriptionService: PrescriptionService, private fb: FormBuilder) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      medicationName: ['', Validators.required],
      dosage: ['', Validators.required],
      instructions: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.prescriptionService.getAll().subscribe({
      next: (data) => { this.prescriptions = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const payload = this.form.value as Partial<Prescription>;
    if (this.isEdit && this.editingId) {
      this.prescriptionService.update(this.editingId, payload).subscribe(() => this.reload());
    } else {
      this.prescriptionService.create(payload).subscribe(() => this.reload());
    }
  }

  edit(p: Prescription) {
    this.isEdit = true;
    this.editingId = p.id;
    this.form.patchValue({
      patientId: p.patientId,
      medicationName: p.medicationName,
      dosage: p.dosage,
      instructions: p.instructions || ''
    });
  }

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset();
  }

  private reload() {
    this.resetForm();
    this.prescriptionService.getAll().subscribe({ next: d => this.prescriptions = d });
  }
}

