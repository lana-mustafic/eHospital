import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prescription, PrescriptionService } from './services/prescription.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

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

  constructor(
    private prescriptionService: PrescriptionService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
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
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load prescriptions');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }
    const payload = this.form.value as Partial<Prescription>;
    if (this.isEdit && this.editingId) {
      this.prescriptionService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Prescription updated successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update prescription');
        }
      });
    } else {
      this.prescriptionService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Prescription created successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create prescription');
        }
      });
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
    this.prescriptionService.getAll().subscribe({
      next: d => this.prescriptions = d,
      error: () => this.toastService.error('Failed to reload prescriptions')
    });
  }
}

