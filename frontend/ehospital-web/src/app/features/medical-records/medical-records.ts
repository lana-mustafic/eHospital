import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecord, MedicalRecordService } from './services/medical-record.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medical-records.html',
  styleUrls: ['./medical-records.scss']
})
export class MedicalRecordsComponent implements OnInit {
  records: MedicalRecord[] = [];
  isLoading = false;
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;

  constructor(
    private recordService: MedicalRecordService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      diagnosis: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.recordService.getAll().subscribe({
      next: (data) => { this.records = data; this.isLoading = false; },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load medical records');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }
    const payload = this.form.value as Partial<MedicalRecord>;
    if (this.isEdit && this.editingId) {
      this.recordService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Medical record updated successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update medical record');
        }
      });
    } else {
      this.recordService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Medical record created successfully');
          this.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create medical record');
        }
      });
    }
  }

  edit(r: MedicalRecord) {
    this.isEdit = true;
    this.editingId = r.id;
    this.form.patchValue({
      patientId: r.patientId,
      diagnosis: r.diagnosis || '',
      notes: r.notes || ''
    });
  }

  onDelete(r: MedicalRecord) {
    if (!r.id) return;
    if (!confirm('Delete this medical record?')) return;
    this.recordService.delete(r.id).subscribe({
      next: () => {
        this.toastService.success('Medical record deleted successfully');
        this.reload();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete medical record');
      }
    });
  }

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset();
  }

  private reload() {
    this.resetForm();
    this.recordService.getAll().subscribe({
      next: d => this.records = d,
      error: () => this.toastService.error('Failed to reload medical records')
    });
  }
}

