import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Diagnosis, DiagnosisService } from './services/diagnosis.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private diagnosisService: DiagnosisService, private fb: FormBuilder) {
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
      error: () => { this.isLoading = false; }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const payload = this.form.value as Partial<Diagnosis>;
    if (this.isEdit && this.editingId) {
      this.diagnosisService.update(this.editingId, payload).subscribe(() => this.reload());
    } else {
      this.diagnosisService.create(payload).subscribe(() => this.reload());
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
    this.diagnosisService.getAll().subscribe({ next: d => this.diagnoses = d });
  }
}

