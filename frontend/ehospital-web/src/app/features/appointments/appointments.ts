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

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private fb: FormBuilder
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
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
        this.loadAppointments();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
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
        this.loadAppointments();
        this.closeStatusModal();
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
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
