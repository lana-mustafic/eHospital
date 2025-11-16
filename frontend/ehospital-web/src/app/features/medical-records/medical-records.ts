import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecord, MedicalRecordService } from './services/medical-record.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private recordService: MedicalRecordService, private fb: FormBuilder) {
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
      error: () => { this.isLoading = false; }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const payload = this.form.value as Partial<MedicalRecord>;
    if (this.isEdit && this.editingId) {
      this.recordService.update(this.editingId, payload).subscribe(() => this.reload());
    } else {
      this.recordService.create(payload).subscribe(() => this.reload());
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

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset();
  }

  private reload() {
    this.resetForm();
    this.recordService.getAll().subscribe({ next: d => this.records = d });
  }
}

