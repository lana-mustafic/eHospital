import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from './services/appointment.service';
import { Appointment, CreateAppointmentRequest, UpdateAppointmentStatusRequest } from './models/appointment.model';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { Patient } from '../patients/models/patient.model';
import { Doctor } from '../doctors/models/doctor.model';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast.service';
import { DoctorScheduleService, DoctorSchedule } from '../doctor-schedules/services/doctor-schedule.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './appointments.html',
  styleUrls: ['./appointments.scss']
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  paginatedAppointments: Appointment[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = '';
  showModal = false;
  showStatusModal = false;
  selectedAppointment: Appointment | null = null;
  appointmentForm: FormGroup;
  statusForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Schedule validation
  doctorSchedules: DoctorSchedule[] = [];
  scheduleValidationMessage = '';
  availabilityCheckInProgress = false;
  isTimeSlotAvailable = false;

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private doctorScheduleService: DoctorScheduleService,
    private exportService: ExportService
  ) {
    this.appointmentForm = this.fb.group({
      patientId: ['', [Validators.required]],
      doctorId: ['', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.statusForm = this.fb.group({
      status: ['Scheduled', [Validators.required]],
      notes: ['']
    });
    
    // Watch for doctor, date, and time changes to validate schedule
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.loadDoctorSchedules();
      this.validateSchedule();
    });
    
    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.validateSchedule();
    });
    
    this.appointmentForm.get('startTime')?.valueChanges.subscribe(() => {
      this.validateSchedule();
    });
    
    this.appointmentForm.get('endTime')?.valueChanges.subscribe(() => {
      this.validateSchedule();
    });
  }
  
  loadDoctorSchedules() {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    if (!doctorId) {
      this.doctorSchedules = [];
      return;
    }
    
    this.doctorScheduleService.getByDoctor(Number(doctorId)).subscribe({
      next: (schedules) => {
        this.doctorSchedules = schedules.filter(s => s.isAvailable);
        this.validateSchedule();
      },
      error: () => {
        this.doctorSchedules = [];
        this.scheduleValidationMessage = '';
      }
    });
  }
  
  validateSchedule() {
    this.scheduleValidationMessage = '';
    this.isTimeSlotAvailable = false;
    this.availabilityCheckInProgress = false;
    
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const date = this.appointmentForm.get('appointmentDate')?.value;
    const startTime = this.appointmentForm.get('startTime')?.value;
    const endTime = this.appointmentForm.get('endTime')?.value;
    
    if (!doctorId || !date || !startTime || !endTime) {
      return;
    }
    
    // Check if doctor has schedule for the selected day
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const daySchedule = this.doctorSchedules.find(s => s.dayOfWeek === dayOfWeek);
    
    if (!daySchedule) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      this.scheduleValidationMessage = `Doctor is not available on ${dayNames[dayOfWeek]}`;
      return;
    }
    
    // Check if time is within doctor's schedule
    const scheduleStart = this.timeToMinutes(daySchedule.startTime);
    const scheduleEnd = this.timeToMinutes(daySchedule.endTime);
    const appointmentStart = this.timeToMinutes(startTime);
    const appointmentEnd = this.timeToMinutes(endTime);
    
    if (appointmentStart < scheduleStart || appointmentEnd > scheduleEnd) {
      this.scheduleValidationMessage = `Time must be between ${daySchedule.startTime.substring(0, 5)} and ${daySchedule.endTime.substring(0, 5)}`;
      return;
    }
    
    if (appointmentStart >= appointmentEnd) {
      this.scheduleValidationMessage = 'End time must be after start time';
      return;
    }
    
    // Check availability with backend
    this.availabilityCheckInProgress = true;
    const normalizedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
    const normalizedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;
    
    this.appointmentService.isAvailable(
      Number(doctorId),
      date,
      normalizedStartTime,
      normalizedEndTime
    ).subscribe({
      next: (isAvailable: boolean) => {
        this.availabilityCheckInProgress = false;
        this.isTimeSlotAvailable = isAvailable;
        if (!isAvailable) {
          this.scheduleValidationMessage = 'This time slot is already booked';
        } else {
          this.scheduleValidationMessage = 'Time slot is available';
        }
      },
      error: () => {
        this.availabilityCheckInProgress = false;
        this.scheduleValidationMessage = 'Unable to verify availability';
      }
    });
  }
  
  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours * 60 + minutes;
  }
  
  canSubmitAppointment(): boolean {
    return this.appointmentForm.valid && 
           this.isTimeSlotAvailable && 
           !this.availabilityCheckInProgress &&
           !this.scheduleValidationMessage.includes('not available') &&
           !this.scheduleValidationMessage.includes('already booked') &&
           !this.scheduleValidationMessage.includes('must be');
  }

  ngOnInit() {
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
        this.filteredAppointments = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load appointments');
      }
    });
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    let filtered = this.appointments;

    // Apply search filter
    if (term) {
      filtered = filtered.filter(appointment =>
        appointment.patientName?.toLowerCase().includes(term) ||
        appointment.doctorName?.toLowerCase().includes(term) ||
        appointment.reason?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === this.statusFilter);
    }

    this.filteredAppointments = filtered;
    this.currentPage = 1; // Reset to first page on search
    this.updatePagination();
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAppointments = this.filteredAppointments.slice(startIndex, endIndex);
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onStatusFilterChange() {
    this.search();
  }

  formatDateTime(date: string, time: string): string {
    if (!date || !time) return '—';
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const dateObj = new Date(`${date}T${normalizedTime}`);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: string): string {
    if (!date) return '—';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'Checked-In':
        return 'status-checkedin';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'No Show':
        return 'status-noshow';
      default:
        return '';
    }
  }

  isPastAppointment(date: string, time: string): boolean {
    if (!date || !time) return false;
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const appointmentDateTime = new Date(`${date}T${normalizedTime}`);
    return appointmentDateTime < new Date();
  }

  canQuickCheckIn(appointment: Appointment): boolean {
    const isReception = this.authService.hasRole('Receptionist');
    if (!isReception) return false;
    if (appointment.status !== 'Scheduled') return false;
    return true;
  }

  quickCheckIn(appointment: Appointment) {
    if (!appointment.id) return;
    const payload: UpdateAppointmentStatusRequest = { status: 'Checked-In' };
    this.appointmentService.updateStatus(appointment.id, payload).subscribe({
      next: () => {
        this.toastService.success('Appointment checked in successfully');
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error checking in appointment:', error);
        this.toastService.error(error.error?.message || 'Failed to check in appointment');
      }
    });
  }
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  openAddModal() {
    this.selectedAppointment = null;
    this.appointmentForm.reset();
    this.statusForm.reset({ status: 'Scheduled', notes: '' });
    this.doctorSchedules = [];
    this.scheduleValidationMessage = '';
    this.isTimeSlotAvailable = false;
    this.availabilityCheckInProgress = false;
    this.showModal = true;
    this.showStatusModal = false;
  }

  openStatusModal(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.statusForm.reset({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    this.showModal = false;
    this.showStatusModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.appointmentForm.reset();
    this.statusForm.reset({ status: 'Scheduled', notes: '' });
    this.selectedAppointment = null;
  }

  saveAppointment() {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }
    
    if (!this.canSubmitAppointment()) {
      this.toastService.warning('Please fix schedule validation errors before submitting');
      return;
    }

    const formData = this.appointmentForm.value;
    const payload: CreateAppointmentRequest = {
      patientId: Number(formData.patientId),
      doctorId: Number(formData.doctorId),
      appointmentDate: formData.appointmentDate,
      startTime: this.toTimeSpan(formData.startTime),
      endTime: this.toTimeSpan(formData.endTime),
      reason: formData.reason
    };

    this.appointmentService.create(payload).subscribe({
      next: () => {
        this.toastService.success('Appointment created successfully');
        this.loadAppointments();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
        this.toastService.error(error.error?.message || 'Failed to create appointment');
      }
    });
  }

  updateStatus() {
    if (!this.selectedAppointment?.id) {
      return;
    }

    if (this.statusForm.invalid) {
      this.markFormGroupTouched(this.statusForm);
      return;
    }

    const payload: UpdateAppointmentStatusRequest = {
      status: this.statusForm.value.status,
      notes: this.statusForm.value.notes
    };

    this.appointmentService.updateStatus(this.selectedAppointment.id, payload).subscribe({
      next: () => {
        this.toastService.success('Appointment status updated successfully');
        this.loadAppointments();
        this.closeStatusModal();
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.toastService.error(error.error?.message || 'Failed to update appointment status');
      }
    });
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedAppointment = null;
    this.statusForm.reset({ status: 'Scheduled', notes: '' });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private toTimeSpan(time: string): string {
    if (!time) {
      return '';
    }
    return time.length === 5 ? `${time}:00` : time;
  }

  get patientId() {
    return this.appointmentForm.get('patientId');
  }

  get doctorId() {
    return this.appointmentForm.get('doctorId');
  }

  get appointmentDate() {
    return this.appointmentForm.get('appointmentDate');
  }

  get startTime() {
    return this.appointmentForm.get('startTime');
  }

  get endTime() {
    return this.appointmentForm.get('endTime');
  }

  get reason() {
    return this.appointmentForm.get('reason');
  }

  get status() {
    return this.statusForm.get('status');
  }
  
  getFieldError(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }
    
    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    
    return 'Invalid value';
  }
  
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'patientId': 'Patient',
      'doctorId': 'Doctor',
      'appointmentDate': 'Appointment date',
      'startTime': 'Start time',
      'endTime': 'End time',
      'reason': 'Reason for visit'
    };
    return labels[fieldName] || fieldName;
  }
  
  exportToCSV() {
    if (this.filteredAppointments.length === 0) {
      this.toastService.warning('No appointments to export');
      return;
    }
    
    const headers = ['Date', 'Time', 'Patient', 'Doctor', 'Specialization', 'Status', 'Reason', 'Notes'];
    const data = this.filteredAppointments.map(apt => ({
      'Date': this.formatDate(apt.appointmentDate),
      'Time': `${apt.startTime} - ${apt.endTime}`,
      'Patient': apt.patientName || '—',
      'Doctor': apt.doctorName || '—',
      'Specialization': apt.doctorSpecialization || '—',
      'Status': apt.status,
      'Reason': apt.reason || '—',
      'Notes': apt.notes || '—'
    }));
    
    this.exportService.exportToCSV(data, 'appointments', headers);
    this.toastService.success('Appointments exported to CSV successfully');
  }
  
  exportToPDF() {
    if (this.filteredAppointments.length === 0) {
      this.toastService.warning('No appointments to export');
      return;
    }
    
    const headers = ['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Reason'];
    const data = this.filteredAppointments.map(apt => ({
      'Date': this.formatDate(apt.appointmentDate),
      'Time': `${apt.startTime} - ${apt.endTime}`,
      'Patient': apt.patientName || '—',
      'Doctor': apt.doctorName || '—',
      'Status': apt.status,
      'Reason': apt.reason || '—'
    }));
    
    this.exportService.exportToPDF(data, 'appointments', headers, 'Appointments Report');
    this.toastService.success('Appointments exported to PDF successfully');
  }
}
