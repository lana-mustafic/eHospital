import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DoctorSchedule, DoctorScheduleService } from './services/doctor-schedule.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { Doctor } from '../doctors/models/doctor.model';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-doctor-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './doctor-schedules.html',
  styleUrls: ['./doctor-schedules.scss']
})
export class DoctorSchedulesComponent implements OnInit {
  doctors: Doctor[] = [];
  schedules: DoctorSchedule[] = [];
  filteredSchedules: DoctorSchedule[] = [];
  paginatedSchedules: DoctorSchedule[] = [];
  selectedDoctorId: number | null = null;
  isLoading = false;
  searchTerm = '';
  dayFilter = '';
  availabilityFilter = '';
  
  form: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  showModal = false;

  days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private scheduleService: DoctorScheduleService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.form = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: () => {
        this.toastService.error('Failed to load doctors');
      }
    });
  }

  loadSchedules(): void {
    if (!this.selectedDoctorId) {
      this.schedules = [];
      this.filteredSchedules = [];
      this.paginatedSchedules = [];
      return;
    }
    
    this.isLoading = true;
    this.scheduleService.getByDoctor(this.selectedDoctorId).subscribe({
      next: (list) => {
        this.schedules = list;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load schedules');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.schedules];

    // Day filter
    if (this.dayFilter) {
      filtered = filtered.filter(s => s.dayOfWeek === Number(this.dayFilter));
    }

    // Availability filter
    if (this.availabilityFilter) {
      if (this.availabilityFilter === 'available') {
        filtered = filtered.filter(s => s.isAvailable);
      } else if (this.availabilityFilter === 'unavailable') {
        filtered = filtered.filter(s => !s.isAvailable);
      }
    }

    this.filteredSchedules = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSchedules.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSchedules = this.filteredSchedules.slice(startIndex, endIndex);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  openAddModal(): void {
    if (!this.selectedDoctorId) {
      this.toastService.warning('Please select a doctor first');
      return;
    }
    this.isEdit = false;
    this.editingId = null;
    this.form.reset({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      isAvailable: true
    });
    this.showModal = true;
  }

  openEditModal(schedule: DoctorSchedule): void {
    this.isEdit = true;
    this.editingId = schedule.id;
    this.form.patchValue({
      dayOfWeek: schedule.dayOfWeek,
      startTime: this.hhmm(schedule.startTime),
      endTime: this.hhmm(schedule.endTime),
      isAvailable: schedule.isAvailable
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  submit(): void {
    if (!this.selectedDoctorId || this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const payload: Partial<DoctorSchedule> = {
      doctorId: this.selectedDoctorId,
      dayOfWeek: Number(this.form.value.dayOfWeek),
      startTime: this.normalize(this.form.value.startTime),
      endTime: this.normalize(this.form.value.endTime),
      isAvailable: !!this.form.value.isAvailable
    };

    if (this.isEdit && this.editingId) {
      this.scheduleService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Schedule updated successfully');
          this.closeModal();
          this.reload();
        },
        error: () => {
          this.toastService.error('Failed to update schedule');
        }
      });
    } else {
      this.scheduleService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Schedule created successfully');
          this.closeModal();
          this.reload();
        },
        error: () => {
          this.toastService.error('Failed to create schedule');
        }
      });
    }
  }

  remove(schedule: DoctorSchedule): void {
    if (!confirm(`Are you sure you want to delete the schedule for ${this.dayLabel(schedule.dayOfWeek)}?`)) {
      return;
    }
    
    this.scheduleService.delete(schedule.id).subscribe({
      next: () => {
        this.toastService.success('Schedule deleted successfully');
        this.reload();
      },
      error: () => {
        this.toastService.error('Failed to delete schedule');
      }
    });
  }

  resetForm(): void {
    this.isEdit = false;
    this.editingId = null;
    this.form.reset({ isAvailable: true });
  }

  private reload(): void {
    this.resetForm();
    this.loadSchedules();
  }

  private normalize(t: string): string {
    return t.length === 5 ? `${t}:00` : t;
  }

  hhmm(t: string): string {
    return t.length === 5 ? t : t.slice(0, 5);
  }

  dayLabel(day: number): string {
    const found = this.days.find(d => d.value === day);
    return found ? found.label : '';
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const duration = end - start;
    
    if (duration <= 0) return 'Invalid';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  private timeToMinutes(time: string): number {
    const normalized = this.hhmm(time);
    const [hours, minutes] = normalized.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getSelectedDoctorName(): string {
    if (!this.selectedDoctorId) return '';
    const doctor = this.doctors.find(d => d.id === this.selectedDoctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'dayOfWeek': 'Day of week',
      'startTime': 'Start time',
      'endTime': 'End time',
      'isAvailable': 'Availability'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  exportToCSV(): void {
    if (!this.selectedDoctorId || this.filteredSchedules.length === 0) {
      this.toastService.warning('No schedules to export');
      return;
    }

    const doctorName = this.getSelectedDoctorName();
    const headers = ['Day', 'Start Time', 'End Time', 'Available'];
    const data = this.filteredSchedules.map(s => ({
      'Day': this.dayLabel(s.dayOfWeek),
      'Start Time': this.hhmm(s.startTime),
      'End Time': this.hhmm(s.endTime),
      'Available': s.isAvailable ? 'Yes' : 'No'
    }));

    this.exportService.exportToCSV(data, `doctor-schedules-${doctorName.replace(/\s+/g, '-')}`, headers);
    this.toastService.success('Schedules exported to CSV successfully');
  }

  exportToPDF(): void {
    if (!this.selectedDoctorId || this.filteredSchedules.length === 0) {
      this.toastService.warning('No schedules to export');
      return;
    }

    const doctorName = this.getSelectedDoctorName();
    const headers = ['Day', 'Start Time', 'End Time', 'Available'];
    const data = this.filteredSchedules.map(s => ({
      'Day': this.dayLabel(s.dayOfWeek),
      'Start Time': this.hhmm(s.startTime),
      'End Time': this.hhmm(s.endTime),
      'Available': s.isAvailable ? 'Yes' : 'No'
    }));

    this.exportService.exportToPDF(data, `doctor-schedules-${doctorName.replace(/\s+/g, '-')}`, headers, `Doctor Schedule - ${doctorName}`);
    this.toastService.success('Schedules exported to PDF successfully');
  }
}
