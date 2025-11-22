import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator/status-indicator';
import { PatientFlowDiagramComponent, FlowNode, FlowConnection } from '../../shared/components/charts/patient-flow-diagram/patient-flow-diagram.component';
import { DepartmentHeatmapComponent, HeatmapData } from '../../shared/components/charts/department-heatmap/department-heatmap.component';
import { RevenuePieChartComponent, RevenueData } from '../../shared/components/charts/revenue-pie-chart/revenue-pie-chart.component';
import { AppointmentDistributionComponent, DistributionData } from '../../shared/components/charts/appointment-distribution/appointment-distribution.component';
import { BedOccupancyTrendsComponent, OccupancyData } from '../../shared/components/charts/bed-occupancy-trends/bed-occupancy-trends.component';
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
import { Doctor } from '../doctors/models/doctor.model';
import { AuthService } from '../../core/services/auth';
import { MetricsService } from './services/metrics.service';
import { MetricsSummary } from './models/metrics.model';
import { forkJoin, of, interval, Subscription } from 'rxjs';
import { catchError, timeout, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LineChartComponent,
    BarChartComponent,
    StatusIndicatorComponent,
    PatientFlowDiagramComponent,
    DepartmentHeatmapComponent,
    RevenuePieChartComponent,
    AppointmentDistributionComponent,
    BedOccupancyTrendsComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy {
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
  
  // New visualization data
  patientFlowNodes: FlowNode[] = [];
  patientFlowConnections: FlowConnection[] = [];
  departmentHeatmapData: HeatmapData[] = [];
  revenueData: RevenueData[] = [];
  appointmentDistributionData: DistributionData[] = [];
  bedOccupancyData: OccupancyData[] = [];
  
  // Realistic Metrics
  metricsSummary?: MetricsSummary;
  showMetrics = false;
  
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
  
  // Receptionist-specific metrics
  pendingInvoicesCount: number = 0;
  todayRevenueAmount: number = 0;
  upcomingAppointmentsToday: Appointment[] = [];
  
  isLoading = false;
  error: string | null = null;

  // Real-time monitoring data
  realtimeData = {
    edPatientCount: 0,
    currentQueueLength: 0,
    availableStaffCount: 0,
    operatingRoomStatus: {
      total: 0,
      occupied: 0,
      available: 0,
      maintenance: 0
    },
    equipmentAvailability: {
      ventilators: { total: 0, available: 0, inUse: 0, maintenance: 0 },
      xrayMachines: { total: 0, available: 0, inUse: 0, maintenance: 0 },
      ctScanners: { total: 0, available: 0, inUse: 0, maintenance: 0 },
      mriMachines: { total: 0, available: 0, inUse: 0, maintenance: 0 },
      ecgMachines: { total: 0, available: 0, inUse: 0, maintenance: 0 },
      ultrasoundMachines: { total: 0, available: 0, inUse: 0, maintenance: 0 }
    }
  };

  // Real-time update subscription
  private realtimeSubscription?: Subscription;
  private readonly REALTIME_UPDATE_INTERVAL = 30000; // 30 seconds

  // Trend Analysis data
  trendAnalysisData = {
    revenueTrends: {
      daily: [] as Array<{ date: string; revenue: number; target: number }>,
      weekly: [] as Array<{ week: string; revenue: number; growth: number }>,
      monthly: [] as Array<{ month: string; revenue: number; growth: number }>
    },
    patientVolumeTrends: {
      daily: [] as Array<{ date: string; inPatients: number; outPatients: number; emergency: number }>,
      weekly: [] as Array<{ week: string; totalPatients: number; growth: number }>,
      monthly: [] as Array<{ month: string; totalPatients: number; growth: number }>
    },
    appointmentNoShowRates: {
      overall: 0,
      byDepartment: [] as Array<{ department: string; noShowRate: number; totalAppointments: number; noShows: number }>,
      trend: [] as Array<{ date: string; noShowRate: number }>
    },
    bedTurnoverRates: {
      overall: 0,
      byDepartment: [] as Array<{ department: string; turnoverRate: number; avgStayDays: number; discharges: number }>,
      trend: [] as Array<{ date: string; turnoverRate: number; occupancyRate: number }>
    },
    departmentPerformance: [] as Array<{
      department: string;
      efficiency: number;
      patientSatisfaction: number;
      avgWaitTime: number;
      revenue: number;
      utilization: number;
      staffProductivity: number;
      trend: 'up' | 'down' | 'stable'
    }>,
    workflowImprovements: [] as Array<{
      area: string;
      currentMetric: number;
      targetMetric: number;
      improvementPotential: number;
      priority: 'high' | 'medium' | 'low';
      suggestions: string[];
      estimatedImpact: string;
    }>
  };

  // Trend analysis display settings
  selectedRevenuePeriod: 'daily' | 'weekly' | 'monthly' = 'monthly';
  selectedPatientVolumePeriod: 'daily' | 'weekly' | 'monthly' = 'weekly';

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
    private authService: AuthService,
    private metricsService: MetricsService
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
    // Load realistic metrics for admin users
    if (this.isAdmin) {
      this.loadMetrics();
      this.loadTrendAnalysisData();
    }
    // Start real-time monitoring
    this.startRealtimeMonitoring();
  }

  ngOnDestroy() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
  }

  loadMetrics() {
    this.metricsService.getMetricsSummary().subscribe({
      next: (metrics) => {
        this.metricsSummary = metrics;
        this.showMetrics = true;
      },
      error: (err) => {
        console.error('Error loading metrics:', err);
        // Don't show error to user, just don't display metrics
      }
    });
  }

  getCategoryLabel(key: string): string {
    const labels: { [key: string]: string } = {
      service: 'Service',
      cleanliness: 'Cleanliness',
      communication: 'Communication',
      waitTime: 'Wait Time',
      overall: 'Overall'
    };
    return labels[key] || key;
  }

  getSatisfactionCategories(): Array<[string, number]> {
    if (!this.metricsSummary?.patientSatisfaction?.byCategory) {
      return [];
    }
    return Object.entries(this.metricsSummary.patientSatisfaction.byCategory);
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    // Build forkJoin object based on user role
    const requests: any = {
      appointments: this.appointmentService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      )
    };

    // Patients - only for Admin, Doctor, Nurse (Receptionist doesn't have access to getAll)
    if (this.isAdmin || this.isDoctor || this.isNurse) {
      requests.patients = this.patientService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
    }

    // Admin can see everything
    if (this.isAdmin) {
      requests.doctors = this.doctorService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.departments = this.departmentService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.medicalRecords = this.medicalRecordService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.diagnoses = this.diagnosisService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.prescriptions = this.prescriptionService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.invoices = this.invoiceService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
    }

    // Doctor can see medical records, diagnoses, prescriptions
    if (this.isDoctor || this.isAdmin) {
      requests.medicalRecords = this.medicalRecordService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.diagnoses = this.diagnosisService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
      requests.prescriptions = this.prescriptionService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
    }

    // Nurse and Receptionist can see rooms
    if (this.isNurse || this.isReceptionist || this.isAdmin) {
      requests.rooms = this.roomService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
    }

    // Receptionist can see invoices
    if (this.isReceptionist || this.isAdmin) {
      requests.invoices = this.invoiceService.getAll().pipe(
        timeout(10000),
        catchError(() => of([]))
      );
    }

    forkJoin(requests).subscribe({
      next: (data: any) => {
        // Ensure all data arrays are defined (only for data that was requested)
        const patients = Array.isArray(data.patients) ? data.patients : [];
        const doctors = Array.isArray(data.doctors) ? data.doctors : [];
        const appointments = Array.isArray(data.appointments) ? data.appointments : [];
        const departments = Array.isArray(data.departments) ? data.departments : [];
        const medicalRecords = Array.isArray(data.medicalRecords) ? data.medicalRecords : [];
        const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [];
        const prescriptions = Array.isArray(data.prescriptions) ? data.prescriptions : [];
        const rooms = Array.isArray(data.rooms) ? data.rooms : [];
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];

        // Patient metrics (only if patients were loaded)
        if (patients.length > 0 || this.isAdmin || this.isDoctor || this.isNurse) {
          this.totalPatients = patients.length;
          this.activePatients = patients.length; // Can be enhanced with active status check
          this.inPatients = 0; // Would need patient status field
          this.outPatients = this.totalPatients - this.inPatients;
        } else {
          // For receptionists, estimate from appointments
          const uniquePatientIds = new Set(appointments.map((apt: Appointment) => apt.patientId));
          this.totalPatients = uniquePatientIds.size;
          this.activePatients = uniquePatientIds.size;
          this.inPatients = 0;
          this.outPatients = this.totalPatients;
        }

        // Staff metrics (only for Admin)
        if (this.isAdmin && doctors.length > 0) {
          this.totalDoctors = doctors.length;
          this.doctorsOnDuty = doctors.length; // Can be enhanced with schedule check
        }
        this.totalNurses = 0; // Would need nurse entity

        // Appointment metrics
        this.totalAppointments = appointments.length;
        this.pendingAppointments = appointments.filter((apt: Appointment) => apt && apt.status === 'Scheduled').length;

        // Calculate today's appointments
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(
          (apt: Appointment) => apt && apt.appointmentDate === todayStr
        );
        this.todayAppointments = todayAppts.length;

        // Today's schedule (sorted by time) - filter out invalid appointments
        this.todaySchedule = todayAppts
          .filter((apt: Appointment) => apt && apt.status === 'Scheduled' && apt.startTime)
          .sort((a: Appointment, b: Appointment) => {
            const timeA = this.normalizeTime(a.startTime || '');
            const timeB = this.normalizeTime(b.startTime || '');
            return timeA.localeCompare(timeB);
          });

        // Calculate upcoming appointments (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        this.upcomingAppointments = appointments.filter((apt: Appointment) => {
          if (!apt || !apt.appointmentDate) return false;
          const aptDate = new Date(apt.appointmentDate);
          const todayDate = new Date();
          return aptDate >= todayDate && aptDate <= nextWeek && apt.status === 'Scheduled';
        }).length;

        // Status breakdown
        this.scheduledCount = appointments.filter((apt: Appointment) => apt && apt.status === 'Scheduled').length;
        this.completedCount = appointments.filter((apt: Appointment) => apt && apt.status === 'Completed').length;
        this.cancelledCount = appointments.filter((apt: Appointment) => apt && apt.status === 'Cancelled').length;
        this.noShowCount = appointments.filter((apt: Appointment) => apt && apt.status === 'No Show').length;

        // Completed this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.completedThisMonth = appointments.filter((apt: Appointment) => {
          if (!apt || !apt.appointmentDate) return false;
          const aptDate = new Date(apt.appointmentDate);
          return apt.status === 'Completed' && aptDate >= firstDayOfMonth;
        }).length;

        // Get recent appointments (last 5, sorted by date) - filter out invalid appointments
        this.recentAppointments = appointments
          .filter((apt: Appointment) => apt && apt.appointmentDate && apt.startTime)
          .sort((a: Appointment, b: Appointment) => {
            const dateA = new Date(`${a.appointmentDate}T${this.normalizeTime(a.startTime || '')}`);
            const dateB = new Date(`${b.appointmentDate}T${this.normalizeTime(b.startTime || '')}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        // Doctor-specific data
        if (this.isDoctor) {
          const currentUser = this.authService.getCurrentUser();
          // Find doctor entity that matches current user by email (only if doctors were loaded)
          const myDoctor = doctors.length > 0 ? doctors.find((doc: Doctor) => {
            return doc && doc.email && currentUser?.email && doc.email.toLowerCase() === currentUser.email.toLowerCase();
          }) : null;
          
          if (myDoctor) {
            const myDoctorId = myDoctor.id;
            // Filter appointments for current doctor
            const myAppointments = appointments.filter((apt: Appointment) => apt && apt.doctorId === myDoctorId);
            this.myAppointmentsToday = myAppointments.filter((apt: Appointment) => apt.appointmentDate === todayStr && apt.status === 'Scheduled');
            this.myUpcomingAppointments = myAppointments.filter((apt: Appointment) => {
              if (!apt || !apt.appointmentDate) return false;
              const aptDate = new Date(apt.appointmentDate);
              const todayDate = new Date();
              return aptDate >= todayDate && apt.status === 'Scheduled';
            }).slice(0, 10);
            // Count unique patients
            const uniquePatientIds = new Set(myAppointments.map((apt: Appointment) => apt.patientId));
            this.myPatientsCount = uniquePatientIds.size;
          }
        }

        // Bed & Room metrics (only if rooms were loaded)
        if (rooms.length > 0) {
          this.totalRooms = rooms.length;
          this.occupiedRooms = rooms.filter((room: any) => room.status === 'Occupied' || room.status === 'Maintenance').length;
          this.totalBeds = rooms.reduce((sum: number, room: any) => sum + (room.totalBeds || 0), 0);
          this.occupiedBeds = rooms.reduce((sum: number, room: any) => sum + (room.occupiedBeds || 0), 0);
          this.availableBeds = rooms.reduce((sum: number, room: any) => sum + (room.availableBeds || 0), 0);
          this.bedOccupancyRate = this.totalBeds > 0 
            ? Math.round((this.occupiedBeds / this.totalBeds) * 100) 
            : 0;
        }

        // Financial metrics (only for Admin and Receptionist)
        if ((this.isAdmin || this.isReceptionist) && invoices.length > 0) {
          const todayDateStr = new Date().toISOString().split('T')[0];
          const todayInvoices = invoices.filter((inv: any) => inv.invoiceDate === todayDateStr);
          this.todayRevenue = todayInvoices.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);
          this.todayRevenueAmount = this.todayRevenue;
          
          const currentDate = new Date();
          const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const monthlyInvoices = invoices.filter((inv: any) => {
            const invDate = new Date(inv.invoiceDate);
            return invDate >= monthStart;
          });
          this.monthlyRevenue = monthlyInvoices.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);
          
          this.outstandingBills = invoices.reduce((sum: number, inv: any) => sum + (inv.balanceAmount || 0), 0);
          this.pendingInvoices = invoices.filter((inv: any) => inv.status === 'Pending' || inv.status === 'Unpaid').length;
          this.pendingInvoicesCount = this.pendingInvoices;
        }

        // Receptionist-specific data
        if (this.isReceptionist) {
          this.upcomingAppointmentsToday = this.todaySchedule.slice(0, 10);
        }

        // Clinical metrics (only for Admin and Doctor)
        if ((this.isAdmin || this.isDoctor) && medicalRecords.length > 0) {
          this.totalMedicalRecords = medicalRecords.length;
        }
        if ((this.isAdmin || this.isDoctor) && diagnoses.length > 0) {
          this.totalDiagnoses = diagnoses.length;
        }
        if ((this.isAdmin || this.isDoctor) && prescriptions.length > 0) {
          this.totalPrescriptions = prescriptions.length;
        }

        // Generate critical alerts
        this.generateAlerts();

        // Calculate chart data
        this.calculateAppointmentTrends(appointments);
        this.calculateMonthlyAppointments(appointments);
        
        // Calculate new visualization data
        this.calculatePatientFlowData();
        this.calculateDepartmentHeatmapData();
        this.calculateRevenueData();
        this.calculateAppointmentDistributionData(appointments);
        this.calculateBedOccupancyData();

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

  private calculatePatientFlowData(): void {
    this.patientFlowNodes = [
      { id: 'registration', label: 'Registration', value: this.totalPatients, color: '#14b8a6' },
      { id: 'triage', label: 'Triage', value: Math.floor(this.totalPatients * 0.85), color: '#0ea5e9' },
      { id: 'consultation', label: 'Consultation', value: Math.floor(this.totalPatients * 0.70), color: '#22c55e' },
      { id: 'treatment', label: 'Treatment', value: Math.floor(this.totalPatients * 0.60), color: '#f59e0b' },
      { id: 'discharge', label: 'Discharge', value: Math.floor(this.totalPatients * 0.55), color: '#10b981' }
    ];

    this.patientFlowConnections = [
      { from: 'registration', to: 'triage', value: Math.floor(this.totalPatients * 0.85) },
      { from: 'triage', to: 'consultation', value: Math.floor(this.totalPatients * 0.70) },
      { from: 'consultation', to: 'treatment', value: Math.floor(this.totalPatients * 0.60) },
      { from: 'treatment', to: 'discharge', value: Math.floor(this.totalPatients * 0.55) }
    ];
  }

  private calculateDepartmentHeatmapData(): void {
    // Sample department utilization data
    this.departmentHeatmapData = [
      { department: 'Emergency', utilization: 92, capacity: 50, current: 46 },
      { department: 'Cardiology', utilization: 75, capacity: 30, current: 23 },
      { department: 'Pediatrics', utilization: 68, capacity: 40, current: 27 },
      { department: 'Orthopedics', utilization: 55, capacity: 25, current: 14 },
      { department: 'Neurology', utilization: 45, capacity: 20, current: 9 },
      { department: 'Oncology', utilization: 38, capacity: 15, current: 6 }
    ];
  }

  private calculateRevenueData(): void {
    // Sample revenue breakdown
    this.revenueData = [
      { category: 'Consultations', amount: 125000, color: '#14b8a6' },
      { category: 'Procedures', amount: 98000, color: '#0ea5e9' },
      { category: 'Lab Tests', amount: 75000, color: '#22c55e' },
      { category: 'Imaging', amount: 62000, color: '#f59e0b' },
      { category: 'Pharmacy', amount: 45000, color: '#ef4444' },
      { category: 'Other', amount: 28000, color: '#8b5cf6' }
    ];
  }

  private calculateAppointmentDistributionData(appointments: Appointment[]): void {
    const distribution: { [key: string]: number } = {};
    if (Array.isArray(appointments)) {
      appointments.forEach(apt => {
        const hour = parseInt(apt.startTime?.split(':')[0] || '9');
        const timeSlot = hour < 12 ? 'Morning (8-12)' : hour < 17 ? 'Afternoon (12-17)' : 'Evening (17-20)';
        distribution[timeSlot] = (distribution[timeSlot] || 0) + 1;
      });
    }

    this.appointmentDistributionData = [
      { label: 'Morning (8-12)', value: distribution['Morning (8-12)'] || 0, color: '#14b8a6' },
      { label: 'Afternoon (12-17)', value: distribution['Afternoon (12-17)'] || 0, color: '#0ea5e9' },
      { label: 'Evening (17-20)', value: distribution['Evening (17-20)'] || 0, color: '#f59e0b' }
    ];
  }

  private calculateBedOccupancyData(): void {
    // Generate 30 days of bed occupancy data
    const today = new Date();
    this.bedOccupancyData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const occupied = Math.floor(Math.random() * 80) + 60; // 60-140 beds
      const available = Math.floor(Math.random() * 40) + 20; // 20-60 beds
      
      this.bedOccupancyData.push({
        date: date.toISOString().split('T')[0],
        occupied,
        available,
        total: occupied + available
      });
    }
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

  getInProgressCount(): number {
    return this.todaySchedule.filter((apt: Appointment) => apt.status === 'Checked-In').length;
  }

  getAppointmentStatusType(appointment: Appointment): 'completed' | 'pending' | 'overdue' | 'cancelled' {
    if (appointment.status === 'Completed') {
      return 'completed';
    }
    if (appointment.status === 'Cancelled' || appointment.status === 'No Show') {
      return 'cancelled';
    }
    if (this.isPastAppointment(appointment.appointmentDate, appointment.startTime)) {
      return 'overdue';
    }
    return 'pending';
  }

  isPastAppointment(date: string, time: string): boolean {
    if (!date || !time) return false;
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const appointmentDateTime = new Date(`${date}T${normalizedTime}`);
    return appointmentDateTime < new Date();
  }

  isOverdueAppointment(appointment: Appointment): boolean {
    return appointment.status === 'Scheduled' && this.isPastAppointment(appointment.appointmentDate, appointment.startTime);
  }

  // Real-time monitoring methods
  private startRealtimeMonitoring() {
    // Initial load
    this.loadRealtimeData();
    
    // Set up periodic updates
    this.realtimeSubscription = interval(this.REALTIME_UPDATE_INTERVAL)
      .pipe(
        switchMap(() => this.loadRealtimeData())
      )
      .subscribe();
  }

  private loadRealtimeData() {
    // Simulate real-time data loading - in a real app, this would call actual APIs
    return new Promise<void>((resolve) => {
      // ED Patient Count (Emergency Department)
      this.realtimeData.edPatientCount = this.generateRandomCount(5, 25);
      
      // Current Queue Length
      this.realtimeData.currentQueueLength = this.pendingAppointments + this.generateRandomCount(0, 10);
      
      // Available Staff Count
      this.realtimeData.availableStaffCount = this.generateRandomCount(15, 45);
      
      // Operating Room Status
      this.realtimeData.operatingRoomStatus = {
        total: 8,
        occupied: this.generateRandomCount(2, 6),
        available: 0,
        maintenance: this.generateRandomCount(0, 2)
      };
      this.realtimeData.operatingRoomStatus.available = 
        this.realtimeData.operatingRoomStatus.total - 
        this.realtimeData.operatingRoomStatus.occupied - 
        this.realtimeData.operatingRoomStatus.maintenance;
      
      // Equipment Availability
      this.updateEquipmentAvailability();
      
      resolve();
    });
  }

  private updateEquipmentAvailability() {
    const equipmentTypes = [
      { key: 'ventilators', total: 12 },
      { key: 'xrayMachines', total: 6 },
      { key: 'ctScanners', total: 3 },
      { key: 'mriMachines', total: 2 },
      { key: 'ecgMachines', total: 15 },
      { key: 'ultrasoundMachines', total: 8 }
    ];

    equipmentTypes.forEach(equipment => {
      const maintenance = this.generateRandomCount(0, Math.max(1, Math.floor(equipment.total * 0.2)));
      const inUse = this.generateRandomCount(0, equipment.total - maintenance);
      const available = equipment.total - inUse - maintenance;
      
      (this.realtimeData.equipmentAvailability as any)[equipment.key] = {
        total: equipment.total,
        available,
        inUse,
        maintenance
      };
    });
  }

  private generateRandomCount(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Helper methods for real-time monitoring display
  getEquipmentStatusClass(available: number, total: number): string {
    const percentage = (available / total) * 100;
    if (percentage >= 70) return 'status-good';
    if (percentage >= 40) return 'status-warning';
    return 'status-critical';
  }

  getORStatusClass(available: number, total: number): string {
    const percentage = (available / total) * 100;
    if (percentage >= 50) return 'status-good';
    if (percentage >= 25) return 'status-warning';
    return 'status-critical';
  }

  getQueueStatusClass(queueLength: number): string {
    if (queueLength <= 5) return 'status-good';
    if (queueLength <= 15) return 'status-warning';
    return 'status-critical';
  }

  getStaffStatusClass(staffCount: number): string {
    if (staffCount >= 30) return 'status-good';
    if (staffCount >= 20) return 'status-warning';
    return 'status-critical';
  }

  getEDStatusClass(edCount: number): string {
    if (edCount <= 10) return 'status-good';
    if (edCount <= 20) return 'status-warning';
    return 'status-critical';
  }

  getEquipmentName(key: string): string {
    const names: { [key: string]: string } = {
      ventilators: 'Ventilators',
      xrayMachines: 'X-Ray Machines',
      ctScanners: 'CT Scanners',
      mriMachines: 'MRI Machines',
      ecgMachines: 'ECG Machines',
      ultrasoundMachines: 'Ultrasound Machines'
    };
    return names[key] || key;
  }

  refreshRealtimeData() {
    this.loadRealtimeData();
  }

  getEquipmentEntries(): Array<[string, any]> {
    return Object.entries(this.realtimeData.equipmentAvailability);
  }

  // Trend Analysis methods
  loadTrendAnalysisData() {
    this.loadRevenueTrends();
    this.loadPatientVolumeTrends();
    this.loadAppointmentNoShowRates();
    this.loadBedTurnoverRates();
    this.loadDepartmentPerformance();
    this.loadWorkflowImprovements();
  }

  private loadRevenueTrends() {
    // Generate daily revenue trends (last 30 days)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const baseRevenue = 15000 + Math.random() * 10000;
      const target = 18000;
      dailyData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue),
        target
      });
    }
    this.trendAnalysisData.revenueTrends.daily = dailyData;

    // Generate weekly revenue trends (last 12 weeks)
    const weeklyData = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const revenue = 100000 + Math.random() * 50000;
      const prevRevenue = 100000 + Math.random() * 50000;
      const growth = ((revenue - prevRevenue) / prevRevenue) * 100;
      weeklyData.push({
        week: `Week ${52 - i}`,
        revenue: Math.round(revenue),
        growth: Math.round(growth * 100) / 100
      });
    }
    this.trendAnalysisData.revenueTrends.weekly = weeklyData;

    // Generate monthly revenue trends (last 12 months)
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const revenue = 400000 + Math.random() * 200000;
      const prevRevenue = 400000 + Math.random() * 200000;
      const growth = ((revenue - prevRevenue) / prevRevenue) * 100;
      monthlyData.push({
        month: months[date.getMonth()],
        revenue: Math.round(revenue),
        growth: Math.round(growth * 100) / 100
      });
    }
    this.trendAnalysisData.revenueTrends.monthly = monthlyData;
  }

  private loadPatientVolumeTrends() {
    // Generate daily patient volume trends (last 30 days)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyData.push({
        date: date.toISOString().split('T')[0],
        inPatients: Math.floor(Math.random() * 50) + 80,
        outPatients: Math.floor(Math.random() * 100) + 150,
        emergency: Math.floor(Math.random() * 30) + 20
      });
    }
    this.trendAnalysisData.patientVolumeTrends.daily = dailyData;

    // Generate weekly trends
    const weeklyData = [];
    for (let i = 11; i >= 0; i--) {
      const totalPatients = Math.floor(Math.random() * 500) + 1200;
      const prevTotal = Math.floor(Math.random() * 500) + 1200;
      const growth = ((totalPatients - prevTotal) / prevTotal) * 100;
      weeklyData.push({
        week: `Week ${52 - i}`,
        totalPatients,
        growth: Math.round(growth * 100) / 100
      });
    }
    this.trendAnalysisData.patientVolumeTrends.weekly = weeklyData;

    // Generate monthly trends
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const totalPatients = Math.floor(Math.random() * 2000) + 5000;
      const prevTotal = Math.floor(Math.random() * 2000) + 5000;
      const growth = ((totalPatients - prevTotal) / prevTotal) * 100;
      monthlyData.push({
        month: months[date.getMonth()],
        totalPatients,
        growth: Math.round(growth * 100) / 100
      });
    }
    this.trendAnalysisData.patientVolumeTrends.monthly = monthlyData;
  }

  private loadAppointmentNoShowRates() {
    this.trendAnalysisData.appointmentNoShowRates.overall = 12.5;
    
    const departments = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Neurology', 'Oncology'];
    this.trendAnalysisData.appointmentNoShowRates.byDepartment = departments.map(dept => {
      const totalAppointments = Math.floor(Math.random() * 200) + 100;
      const noShows = Math.floor(totalAppointments * (Math.random() * 0.2 + 0.05));
      const noShowRate = (noShows / totalAppointments) * 100;
      return {
        department: dept,
        noShowRate: Math.round(noShowRate * 100) / 100,
        totalAppointments,
        noShows
      };
    });

    // Generate trend data (last 30 days)
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const noShowRate = Math.random() * 20 + 5; // 5-25% range
      trendData.push({
        date: date.toISOString().split('T')[0],
        noShowRate: Math.round(noShowRate * 100) / 100
      });
    }
    this.trendAnalysisData.appointmentNoShowRates.trend = trendData;
  }

  private loadBedTurnoverRates() {
    this.trendAnalysisData.bedTurnoverRates.overall = 2.3;

    const departments = ['ICU', 'Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'General Medicine'];
    this.trendAnalysisData.bedTurnoverRates.byDepartment = departments.map(dept => {
      const avgStayDays = Math.random() * 8 + 2; // 2-10 days
      const discharges = Math.floor(Math.random() * 50) + 20;
      const turnoverRate = 30 / avgStayDays; // beds per month
      return {
        department: dept,
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        avgStayDays: Math.round(avgStayDays * 100) / 100,
        discharges
      };
    });

    // Generate trend data (last 30 days)
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const turnoverRate = Math.random() * 2 + 1.5; // 1.5-3.5 range
      const occupancyRate = Math.random() * 30 + 70; // 70-100% range
      trendData.push({
        date: date.toISOString().split('T')[0],
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      });
    }
    this.trendAnalysisData.bedTurnoverRates.trend = trendData;
  }

  private loadDepartmentPerformance() {
    const departments = ['Cardiology', 'Emergency', 'Surgery', 'Pediatrics', 'Orthopedics', 'Neurology'];
    this.trendAnalysisData.departmentPerformance = departments.map(dept => {
      const efficiency = Math.random() * 30 + 70; // 70-100%
      const patientSatisfaction = Math.random() * 20 + 80; // 80-100%
      const avgWaitTime = Math.random() * 45 + 15; // 15-60 minutes
      const revenue = Math.random() * 100000 + 50000; // $50k-$150k
      const utilization = Math.random() * 25 + 75; // 75-100%
      const staffProductivity = Math.random() * 20 + 80; // 80-100%
      const trends = ['up', 'down', 'stable'] as const;
      const trend = trends[Math.floor(Math.random() * trends.length)];

      return {
        department: dept,
        efficiency: Math.round(efficiency * 100) / 100,
        patientSatisfaction: Math.round(patientSatisfaction * 100) / 100,
        avgWaitTime: Math.round(avgWaitTime),
        revenue: Math.round(revenue),
        utilization: Math.round(utilization * 100) / 100,
        staffProductivity: Math.round(staffProductivity * 100) / 100,
        trend
      };
    });
  }

  private loadWorkflowImprovements() {
    this.trendAnalysisData.workflowImprovements = [
      {
        area: 'Patient Check-in Process',
        currentMetric: 8.5,
        targetMetric: 5.0,
        improvementPotential: 41.2,
        priority: 'high' as const,
        suggestions: [
          'Implement digital check-in kiosks',
          'Pre-registration via mobile app',
          'Automated insurance verification'
        ],
        estimatedImpact: '3.5 min reduction in wait time'
      },
      {
        area: 'Bed Assignment Efficiency',
        currentMetric: 45,
        targetMetric: 30,
        improvementPotential: 33.3,
        priority: 'high' as const,
        suggestions: [
          'Real-time bed tracking system',
          'Automated housekeeping notifications',
          'Predictive discharge planning'
        ],
        estimatedImpact: '15 min faster bed assignments'
      },
      {
        area: 'Lab Result Processing',
        currentMetric: 120,
        targetMetric: 90,
        improvementPotential: 25.0,
        priority: 'medium' as const,
        suggestions: [
          'Automated result distribution',
          'Priority flagging system',
          'Integration with EMR alerts'
        ],
        estimatedImpact: '30 min faster result delivery'
      },
      {
        area: 'Medication Administration',
        currentMetric: 15,
        targetMetric: 10,
        improvementPotential: 33.3,
        priority: 'medium' as const,
        suggestions: [
          'Barcode scanning for medications',
          'Electronic medication records',
          'Automated dosage calculations'
        ],
        estimatedImpact: '5 min reduction per administration'
      },
      {
        area: 'Discharge Process',
        currentMetric: 180,
        targetMetric: 120,
        improvementPotential: 33.3,
        priority: 'low' as const,
        suggestions: [
          'Electronic discharge summaries',
          'Automated prescription sending',
          'Digital patient education materials'
        ],
        estimatedImpact: '60 min faster discharge process'
      }
    ];
  }

  // Helper methods for trend analysis
  getRevenueTrendData() {
    switch (this.selectedRevenuePeriod) {
      case 'daily': return this.trendAnalysisData.revenueTrends.daily;
      case 'weekly': return this.trendAnalysisData.revenueTrends.weekly;
      case 'monthly': return this.trendAnalysisData.revenueTrends.monthly;
      default: return this.trendAnalysisData.revenueTrends.monthly;
    }
  }

  getPatientVolumeTrendData() {
    switch (this.selectedPatientVolumePeriod) {
      case 'daily': return this.trendAnalysisData.patientVolumeTrends.daily;
      case 'weekly': return this.trendAnalysisData.patientVolumeTrends.weekly;
      case 'monthly': return this.trendAnalysisData.patientVolumeTrends.monthly;
      default: return this.trendAnalysisData.patientVolumeTrends.weekly;
    }
  }

  getPerformanceStatusClass(value: number, threshold: { good: number; warning: number }): string {
    if (value >= threshold.good) return 'status-good';
    if (value >= threshold.warning) return 'status-warning';
    return 'status-critical';
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'stable': return 'trending_flat';
      default: return 'trending_flat';
    }
  }

  getTrendClass(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-stable';
    }
  }

  getPriorityClass(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  formatCurrencyShort(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getTotalMonthlyRevenue(): number {
    return this.trendAnalysisData.revenueTrends.monthly.reduce((sum, item) => sum + item.revenue, 0);
  }

  getLatestMonthlyGrowth(): number {
    const monthly = this.trendAnalysisData.revenueTrends.monthly;
    return monthly.length > 0 ? monthly[monthly.length - 1].growth : 0;
  }

  getRevenueTooltip(item: any, period: string): string {
    if (period === 'daily') {
      return `${item.date}: ${this.formatCurrencyShort(item.revenue)}`;
    } else if (period === 'weekly') {
      return `${item.week}: ${this.formatCurrencyShort(item.revenue)}`;
    } else {
      return `${item.month}: ${this.formatCurrencyShort(item.revenue)}`;
    }
  }

  getRevenueLabel(item: any, period: string): string {
    if (period === 'daily') {
      return item.date.split('-')[2];
    } else if (period === 'weekly') {
      return item.week.split(' ')[1];
    } else {
      return item.month;
    }
  }

  getPatientVolumeTooltip(item: any, period: string): string {
    if (period === 'weekly') {
      return `${item.week}: ${item.totalPatients} patients`;
    } else {
      return `${item.month}: ${item.totalPatients} patients`;
    }
  }

  getPatientVolumeLabel(item: any, period: string): string {
    if (period === 'weekly') {
      return item.week.split(' ')[1];
    } else {
      return item.month;
    }
  }

  getPatientVolumeHeight(item: any): number {
    if ('totalPatients' in item) {
      return (item.totalPatients / 7000) * 100;
    }
    return 0;
  }
}
