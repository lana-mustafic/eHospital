import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentRemindersComponent } from '../../shared/components/appointment-reminders/appointment-reminders.component';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { AppointmentService } from '../appointments/services/appointment.service';
import { DepartmentService } from '../departments/services/department.service';
import { Appointment } from '../appointments/models/appointment.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AppointmentRemindersComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  totalPatients = 0;
  totalDoctors = 0;
  totalAppointments = 0;
  totalDepartments = 0;
  todayAppointments = 0;
  upcomingAppointments = 0;
  recentAppointments: Appointment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      patients: this.patientService.getAll(),
      doctors: this.doctorService.getAll(),
      appointments: this.appointmentService.getAll(),
      departments: this.departmentService.getAll()
    }).subscribe({
      next: (data) => {
        this.totalPatients = data.patients.length;
        this.totalDoctors = data.doctors.length;
        this.totalAppointments = data.appointments.length;
        this.totalDepartments = data.departments.length;

        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        this.todayAppointments = data.appointments.filter(
          apt => apt.appointmentDate === today
        ).length;

        // Calculate upcoming appointments (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        this.upcomingAppointments = data.appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          const todayDate = new Date();
          return aptDate >= todayDate && aptDate <= nextWeek && apt.status === 'Scheduled';
        }).length;

        // Get recent appointments (last 5, sorted by date)
        this.recentAppointments = data.appointments
          .sort((a, b) => {
            const dateA = new Date(`${a.appointmentDate}T${this.normalizeTime(a.startTime)}`);
            const dateB = new Date(`${b.appointmentDate}T${this.normalizeTime(b.startTime)}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  formatDateTime(date: string, time: string): string {
    if (!date || !time) return '—';
    const dateObj = new Date(`${date}T${this.normalizeTime(time)}`);
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private normalizeTime(time: string): string {
    if (!time) {
      return '00:00:00';
    }
    return time.length === 5 ? `${time}:00` : time;
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
}
