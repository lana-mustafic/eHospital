import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentRemindersComponent } from '../../shared/components/appointment-reminders/appointment-reminders.component';
import { StatusPieChartComponent } from '../../shared/components/charts/status-pie-chart/status-pie-chart.component';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { AppointmentService } from '../appointments/services/appointment.service';
import { DepartmentService } from '../departments/services/department.service';
import { MedicalRecordService } from '../medical-records/services/medical-record.service';
import { DiagnosisService } from '../diagnoses/services/diagnosis.service';
import { PrescriptionService } from '../prescriptions/services/prescription.service';
import { Appointment } from '../appointments/models/appointment.model';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppointmentRemindersComponent,
    StatusPieChartComponent,
    LineChartComponent,
    BarChartComponent
  ],
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
  todaySchedule: Appointment[] = [];
  
  // Status breakdown
  scheduledCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  noShowCount = 0;
  
  // Additional stats
  totalMedicalRecords = 0;
  totalDiagnoses = 0;
  totalPrescriptions = 0;
  completedThisMonth = 0;
  
  // Chart data
  appointmentTrendData: Array<{ label: string; value: number }> = [];
  monthlyAppointmentData: Array<{ label: string; value: number; color?: string }> = [];
  
  isLoading = false;
  error: string | null = null;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private departmentService: DepartmentService,
    private medicalRecordService: MedicalRecordService,
    private diagnosisService: DiagnosisService,
    private prescriptionService: PrescriptionService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      patients: this.patientService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      doctors: this.doctorService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      appointments: this.appointmentService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      departments: this.departmentService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      medicalRecords: this.medicalRecordService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      diagnoses: this.diagnosisService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      prescriptions: this.prescriptionService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      )
    }).subscribe({
      next: (data) => {
        // Ensure all data arrays are defined
        const patients = Array.isArray(data.patients) ? data.patients : [];
        const doctors = Array.isArray(data.doctors) ? data.doctors : [];
        const appointments = Array.isArray(data.appointments) ? data.appointments : [];
        const departments = Array.isArray(data.departments) ? data.departments : [];
        const medicalRecords = Array.isArray(data.medicalRecords) ? data.medicalRecords : [];
        const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [];
        const prescriptions = Array.isArray(data.prescriptions) ? data.prescriptions : [];

        this.totalPatients = patients.length;
        this.totalDoctors = doctors.length;
        this.totalAppointments = appointments.length;
        this.totalDepartments = departments.length;
        this.totalMedicalRecords = medicalRecords.length;
        this.totalDiagnoses = diagnoses.length;
        this.totalPrescriptions = prescriptions.length;

        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(
          apt => apt && apt.appointmentDate === today
        );
        this.todayAppointments = todayAppts.length;

        // Today's schedule (sorted by time) - filter out invalid appointments
        this.todaySchedule = todayAppts
          .filter(apt => apt && apt.status === 'Scheduled' && apt.startTime)
          .sort((a, b) => {
            const timeA = this.normalizeTime(a.startTime || '');
            const timeB = this.normalizeTime(b.startTime || '');
            return timeA.localeCompare(timeB);
          });

        // Calculate upcoming appointments (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        this.upcomingAppointments = appointments.filter(apt => {
          if (!apt || !apt.appointmentDate) return false;
          const aptDate = new Date(apt.appointmentDate);
          const todayDate = new Date();
          return aptDate >= todayDate && aptDate <= nextWeek && apt.status === 'Scheduled';
        }).length;

        // Status breakdown
        this.scheduledCount = appointments.filter(apt => apt && apt.status === 'Scheduled').length;
        this.completedCount = appointments.filter(apt => apt && apt.status === 'Completed').length;
        this.cancelledCount = appointments.filter(apt => apt && apt.status === 'Cancelled').length;
        this.noShowCount = appointments.filter(apt => apt && apt.status === 'No Show').length;

        // Completed this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.completedThisMonth = appointments.filter(apt => {
          if (!apt || !apt.appointmentDate) return false;
          const aptDate = new Date(apt.appointmentDate);
          return apt.status === 'Completed' && aptDate >= firstDayOfMonth;
        }).length;

        // Get recent appointments (last 5, sorted by date) - filter out invalid appointments
        this.recentAppointments = appointments
          .filter(apt => apt && apt.appointmentDate && apt.startTime)
          .sort((a, b) => {
            const dateA = new Date(`${a.appointmentDate}T${this.normalizeTime(a.startTime || '')}`);
            const dateB = new Date(`${b.appointmentDate}T${this.normalizeTime(b.startTime || '')}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        // Calculate chart data
        this.calculateAppointmentTrends(appointments);
        this.calculateMonthlyAppointments(appointments);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        // Even if forkJoin fails completely, try to show what we can
        // Individual errors are already caught above
        this.error = 'Some dashboard data could not be loaded. Please refresh the page.';
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

  formatTime(time: string): string {
    if (!time) return '—';
    const normalized = this.normalizeTime(time);
    const [hours, minutes] = normalized.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  private calculateAppointmentTrends(appointments: Appointment[]): void {
    // Get appointments for the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const trendData: Array<{ label: string; value: number }> = [];
    
    if (!Array.isArray(appointments)) {
      this.appointmentTrendData = trendData;
      return;
    }
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = appointments.filter(apt => apt && apt.appointmentDate === dateStr).length;
      
      trendData.push({
        label: dayName,
        value: count
      });
    }
    
    this.appointmentTrendData = trendData;
  }

  private calculateMonthlyAppointments(appointments: Appointment[]): void {
    // Get appointments for the last 6 months
    const today = new Date();
    const monthlyData: Array<{ label: string; value: number; color?: string }> = [];
    
    if (!Array.isArray(appointments)) {
      this.monthlyAppointmentData = monthlyData;
      return;
    }
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      const firstDay = new Date(year, date.getMonth(), 1);
      const lastDay = new Date(year, date.getMonth() + 1, 0);
      
      const count = appointments.filter(apt => {
        if (!apt || !apt.appointmentDate) return false;
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= firstDay && aptDate <= lastDay;
      }).length;
      
      monthlyData.push({
        label: monthName,
        value: count,
        color: '#667eea'
      });
    }
    
    this.monthlyAppointmentData = monthlyData;
  }
}
