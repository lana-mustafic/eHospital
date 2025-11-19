import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { AppointmentService } from '../appointments/services/appointment.service';
import { DepartmentService } from '../departments/services/department.service';
import { MedicalRecordService } from '../medical-records/services/medical-record.service';
import { DiagnosisService } from '../diagnoses/services/diagnosis.service';
import { PrescriptionService } from '../prescriptions/services/prescription.service';
import { RoomService } from '../rooms/services/room.service';
import { InvoiceService } from '../invoices/services/invoice.service';
import { Appointment } from '../appointments/models/appointment.model';
import { AuthService } from '../../core/services/auth';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LineChartComponent,
    BarChartComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  // Patient metrics
  totalPatients = 0;
  activePatients = 0;
  inPatients = 0;
  outPatients = 0;
  
  // Staff metrics
  totalDoctors = 0;
  doctorsOnDuty = 0;
  totalNurses = 0;
  
  // Appointment metrics
  totalAppointments = 0;
  todayAppointments = 0;
  upcomingAppointments = 0;
  pendingAppointments = 0;
  recentAppointments: Appointment[] = [];
  todaySchedule: Appointment[] = [];
  
  // Status breakdown
  scheduledCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  noShowCount = 0;
  
  // Bed & Room metrics
  totalBeds = 0;
  occupiedBeds = 0;
  availableBeds = 0;
  bedOccupancyRate = 0;
  totalRooms = 0;
  occupiedRooms = 0;
  
  // Financial metrics
  todayRevenue = 0;
  monthlyRevenue = 0;
  outstandingBills = 0;
  pendingInvoices = 0;
  
  // Clinical metrics
  totalMedicalRecords = 0;
  totalDiagnoses = 0;
  totalPrescriptions = 0;
  completedThisMonth = 0;
  
  // Alerts
  criticalAlerts: string[] = [];
  
  // Chart data
  appointmentTrendData: Array<{ label: string; value: number }> = [];
  monthlyAppointmentData: Array<{ label: string; value: number; color?: string }> = [];
  
  // User role
  currentUserRole: string = '';
  currentUserName: string = '';
  isDoctor: boolean = false;
  isAdmin: boolean = false;
  isNurse: boolean = false;
  isReceptionist: boolean = false;
  
  // Doctor-specific metrics
  myAppointmentsToday: Appointment[] = [];
  myUpcomingAppointments: Appointment[] = [];
  myPatientsCount: number = 0;
  
  isLoading = false;
  error: string | null = null;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private departmentService: DepartmentService,
    private medicalRecordService: MedicalRecordService,
    private diagnosisService: DiagnosisService,
    private prescriptionService: PrescriptionService,
    private roomService: RoomService,
    private invoiceService: InvoiceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserRole = currentUser.role || '';
      this.currentUserName = currentUser.name || '';
      this.isDoctor = this.currentUserRole.toLowerCase() === 'doctor';
      this.isAdmin = this.currentUserRole.toLowerCase() === 'admin';
      this.isNurse = this.currentUserRole.toLowerCase() === 'nurse';
      this.isReceptionist = this.currentUserRole.toLowerCase() === 'receptionist';
    }
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
      ),
      rooms: this.roomService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      ),
      invoices: this.invoiceService.getAll().pipe(
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
        const rooms = Array.isArray(data.rooms) ? data.rooms : [];
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];

        // Patient metrics
        this.totalPatients = patients.length;
        this.activePatients = patients.length; // Can be enhanced with active status check
        this.inPatients = 0; // Would need patient status field
        this.outPatients = this.totalPatients - this.inPatients;

        // Staff metrics
        this.totalDoctors = doctors.length;
        this.doctorsOnDuty = doctors.length; // Can be enhanced with schedule check
        this.totalNurses = 0; // Would need nurse entity

        // Appointment metrics
        this.totalAppointments = appointments.length;
        this.pendingAppointments = appointments.filter(apt => apt && apt.status === 'Scheduled').length;

        // Calculate today's appointments
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(
          apt => apt && apt.appointmentDate === todayStr
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

        // Doctor-specific data
        if (this.isDoctor) {
          const currentUser = this.authService.getCurrentUser();
          // Find doctor entity that matches current user by email
          const myDoctor = doctors.find(doc => {
            return doc && doc.email && currentUser?.email && doc.email.toLowerCase() === currentUser.email.toLowerCase();
          });
          
          if (myDoctor) {
            const myDoctorId = myDoctor.id;
            // Filter appointments for current doctor
            const myAppointments = appointments.filter(apt => apt && apt.doctorId === myDoctorId);
            this.myAppointmentsToday = myAppointments.filter(apt => apt.appointmentDate === todayStr && apt.status === 'Scheduled');
            this.myUpcomingAppointments = myAppointments.filter(apt => {
              if (!apt || !apt.appointmentDate) return false;
              const aptDate = new Date(apt.appointmentDate);
              const todayDate = new Date();
              return aptDate >= todayDate && apt.status === 'Scheduled';
            }).slice(0, 10);
            // Count unique patients
            const uniquePatientIds = new Set(myAppointments.map(apt => apt.patientId));
            this.myPatientsCount = uniquePatientIds.size;
          }
        }

        // Bed & Room metrics
        this.totalRooms = rooms.length;
        this.occupiedRooms = rooms.filter((room: any) => room.status === 'Occupied' || room.status === 'Maintenance').length;
        this.totalBeds = rooms.reduce((sum: number, room: any) => sum + (room.totalBeds || 0), 0);
        this.occupiedBeds = rooms.reduce((sum: number, room: any) => sum + (room.occupiedBeds || 0), 0);
        this.availableBeds = rooms.reduce((sum: number, room: any) => sum + (room.availableBeds || 0), 0);
        this.bedOccupancyRate = this.totalBeds > 0 
          ? Math.round((this.occupiedBeds / this.totalBeds) * 100) 
          : 0;

        // Financial metrics
        const todayDateStr = new Date().toISOString().split('T')[0];
        const todayInvoices = invoices.filter((inv: any) => inv.invoiceDate === todayDateStr);
        this.todayRevenue = todayInvoices.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);
        
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthlyInvoices = invoices.filter((inv: any) => {
          const invDate = new Date(inv.invoiceDate);
          return invDate >= monthStart;
        });
        this.monthlyRevenue = monthlyInvoices.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);
        
        this.outstandingBills = invoices.reduce((sum: number, inv: any) => sum + (inv.balanceAmount || 0), 0);
        this.pendingInvoices = invoices.filter((inv: any) => inv.status === 'Pending' || inv.status === 'Unpaid').length;

        // Clinical metrics
        this.totalMedicalRecords = medicalRecords.length;
        this.totalDiagnoses = diagnoses.length;
        this.totalPrescriptions = prescriptions.length;

        // Generate critical alerts
        this.generateAlerts();

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

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  private generateAlerts(): void {
    this.criticalAlerts = [];
    
    if (this.bedOccupancyRate >= 90) {
      this.criticalAlerts.push(`High bed occupancy: ${this.bedOccupancyRate}% - Consider discharge planning`);
    }
    
    if (this.availableBeds <= 5 && this.totalBeds > 0) {
      this.criticalAlerts.push(`Critical: Only ${this.availableBeds} beds available`);
    }
    
    if (this.pendingAppointments > 20) {
      this.criticalAlerts.push(`High appointment backlog: ${this.pendingAppointments} pending appointments`);
    }
    
    if (this.outstandingBills > 100000) {
      this.criticalAlerts.push(`High outstanding balance: $${this.outstandingBills.toLocaleString()}`);
    }
    
    if (this.todayAppointments === 0) {
      this.criticalAlerts.push('No appointments scheduled for today');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
