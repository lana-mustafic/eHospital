import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from './services/appointment.service';
import { Appointment } from './models/appointment.model';
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
  isEditMode = false;
  selectedAppointment: Appointment | null = null;
  appointmentForm: FormGroup;

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
      appointmentTime: ['', [Validators.required]],
      duration: [30, [Validators.required, Validators.min(15)]],
      status: ['Scheduled', [Validators.required]],
      appointmentType: [''],
      reason: [''],
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
        appointment.appointmentType?.toLowerCase().includes(term) ||
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
    const dateObj = new Date(date + 'T' + time);
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
    const appointmentDateTime = new Date(date + 'T' + time);
    return appointmentDateTime < new Date();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedAppointment = null;
    this.appointmentForm.reset();
    this.appointmentForm.patchValue({
      status: 'Scheduled',
      duration: 30
    });
    this.showModal = true;
  }

  openEditModal(appointment: Appointment) {
    this.isEditMode = true;
    this.selectedAppointment = appointment;
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration || 30,
      status: appointment.status,
      appointmentType: appointment.appointmentType || '',
      reason: appointment.reason || '',
      notes: appointment.notes || ''
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.appointmentForm.reset();
    this.selectedAppointment = null;
  }

  saveAppointment() {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }

    const formData = this.appointmentForm.value;
    
    // Get patient and doctor names for display
    const patient = this.patients.find(p => p.id === formData.patientId);
    const doctor = this.doctors.find(d => d.id === formData.doctorId);

    const appointment: Appointment = {
      ...formData,
      id: this.selectedAppointment?.id,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
      doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '',
      department: doctor?.department
    };

    if (this.isEditMode && this.selectedAppointment?.id) {
      this.appointmentService.update(this.selectedAppointment.id, appointment).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
        }
      });
    } else {
      this.appointmentService.create(appointment).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
        }
      });
    }
  }

  deleteAppointment(appointment: Appointment) {
    if (!appointment.id) return;
    
    if (confirm(`Are you sure you want to delete this appointment?`)) {
      this.appointmentService.delete(appointment.id).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
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

  get appointmentTime() {
    return this.appointmentForm.get('appointmentTime');
  }

  get status() {
    return this.appointmentForm.get('status');
  }
}
