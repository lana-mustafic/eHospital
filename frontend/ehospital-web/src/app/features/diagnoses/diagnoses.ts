import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Diagnosis, DiagnosisService } from './services/diagnosis.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-diagnoses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './diagnoses.html',
  styleUrls: ['./diagnoses.scss']
})
export class DiagnosesComponent implements OnInit {
  diagnoses: Diagnosis[] = [];
  isLoading = false;
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;

  constructor(
    private diagnosisService: DiagnosisService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      condition: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.diagnosisService.getAll().subscribe({
      next: (data) => { this.diagnoses = data; this.isLoading = false; },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load diagnoses');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }
    const payload = this.form.value as Partial<Diagnosis>;
    if (this.isEdit && this.editingId) {
      this.diagnosisService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Diagnosis updated successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update diagnosis');
        }
      });
    } else {
      this.diagnosisService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Diagnosis created successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create diagnosis');
        }
      });
    }
  }

  edit(d: Diagnosis) {
    this.isEdit = true;
    this.editingId = d.id;
    this.form.patchValue({
      patientId: d.patientId,
      condition: d.condition,
      notes: d.notes || ''
    });
  }

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset();
  }

  private reload() {
    this.resetForm();
    this.diagnosisService.getAll().subscribe({
      next: d => this.diagnoses = d,
      error: () => this.toastService.error('Failed to reload diagnoses')
    });
  }
}

