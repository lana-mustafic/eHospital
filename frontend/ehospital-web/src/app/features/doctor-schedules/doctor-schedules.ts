import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DoctorSchedule, DoctorScheduleService } from './services/doctor-schedule.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { Doctor } from '../doctors/models/doctor.model';

@Component({
  selector: 'app-doctor-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './doctor-schedules.html',
  styleUrls: ['./doctor-schedules.scss']
})
export class DoctorSchedulesComponent implements OnInit {
  doctors: Doctor[] = [];
  schedules: DoctorSchedule[] = [];
  selectedDoctorId: number | null = null;
  isLoading = false;

  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;

  days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  constructor(
    private scheduleService: DoctorScheduleService,
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    this.doctorService.getAll().subscribe({ next: d => this.doctors = d });
  }

  loadSchedules() {
    if (!this.selectedDoctorId) return;
    this.isLoading = true;
    this.scheduleService.getByDoctor(this.selectedDoctorId).subscribe({
      next: (list) => { this.schedules = list; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  submit() {
    if (!this.selectedDoctorId || this.form.invalid) return;
    const payload: Partial<DoctorSchedule> = {
      doctorId: this.selectedDoctorId,
      dayOfWeek: Number(this.form.value.dayOfWeek),
      startTime: this.normalize(this.form.value.startTime),
      endTime: this.normalize(this.form.value.endTime),
      isAvailable: !!this.form.value.isAvailable
    };
    if (this.isEdit && this.editingId) {
      this.scheduleService.update(this.editingId, payload).subscribe(() => this.reload());
    } else {
      this.scheduleService.create(payload).subscribe(() => this.reload());
    }
  }

  edit(s: DoctorSchedule) {
    this.isEdit = true;
    this.editingId = s.id;
    this.form.patchValue({
      dayOfWeek: s.dayOfWeek,
      startTime: this.hhmm(s.startTime),
      endTime: this.hhmm(s.endTime),
      isAvailable: s.isAvailable
    });
  }

  remove(s: DoctorSchedule) {
    if (!confirm('Delete this schedule?')) return;
    this.scheduleService.delete(s.id).subscribe(() => this.reload());
  }

  resetForm() {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset({ isAvailable: true });
  }

  private reload() {
    this.resetForm();
    this.loadSchedules();
  }

  private normalize(t: string): string {
    return t.length === 5 ? `${t}:00` : t;
  }

  private hhmm(t: string): string {
    return t.length === 5 ? t : t.slice(0, 5);
  }

  dayLabel(day: number): string {
    const found = this.days.find(d => d.value === day);
    return found ? found.label : '';
  }
}

