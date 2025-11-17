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

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
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
}
