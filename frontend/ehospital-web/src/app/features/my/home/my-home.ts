import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../patients/services/patient.service';
import { DoctorService } from '../../doctors/services/doctor.service';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Patient } from '../../patients/models/patient.model';
import { Doctor } from '../../doctors/models/doctor.model';
import { Appointment } from '../../appointments/models/appointment.model';
import { AppointmentRemindersComponent } from '../../../shared/components/appointment-reminders/appointment-reminders.component';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription, filter, take, interval, forkJoin, of } from 'rxjs';
import { catchError, switchMap, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-my-home',
  standalone: true,
  imports: [CommonModule, AppointmentRemindersComponent],
  templateUrl: './my-home.html',
  styleUrls: ['./my-home.scss']
})
export class MyHomeComponent implements OnInit, OnDestroy {
  me: Patient | Doctor | null = null;
  upcoming: Appointment[] = [];
  isLoading = false;
  isDoctor = false;
  
  // Real-time stats for doctors
  todayAppointments: Appointment[] = [];
  todayAppointmentsCount = 0;
  upcomingAppointmentsCount = 0;
  completedTodayCount = 0;
  pendingAppointmentsCount = 0;
  nextAppointment: Appointment | null = null;
  lastUpdateTime: Date | null = null;
  isRealTimeActive = false;
  
  private userSubscription?: Subscription;
  private refreshSubscription?: Subscription;
  private previousAppointmentIds: Set<number> = new Set();

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Wait for user to be loaded before checking role
    const currentUser = this.authService.getCurrentUser();
    console.log('MyHomeComponent - Current user:', currentUser);
    console.log('MyHomeComponent - User role:', currentUser?.role);
    console.log('MyHomeComponent - Full user object:', JSON.stringify(currentUser, null, 2));
    
    if (currentUser) {
      // Check role more explicitly
      const role = (currentUser.role || '').toLowerCase().trim();
      console.log('MyHomeComponent - Normalized role:', role);
      this.isDoctor = role === 'doctor';
      console.log('MyHomeComponent - isDoctor:', this.isDoctor);
      this.load();
    } else {
      // Wait for user to load
      this.userSubscription = this.authService.currentUser$
        .pipe(
          filter(user => user !== null),
          take(1)
        )
        .subscribe(user => {
          console.log('MyHomeComponent - User loaded from observable:', user);
          console.log('MyHomeComponent - Full user object from observable:', JSON.stringify(user, null, 2));
          const role = (user.role || '').toLowerCase().trim();
          console.log('MyHomeComponent - Normalized role from observable:', role);
          this.isDoctor = role === 'doctor';
          console.log('MyHomeComponent - isDoctor after user load:', this.isDoctor);
          this.load();
        });
    }
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
    this.isRealTimeActive = false;
  }

  private load() {
    this.isLoading = true;
    
    if (this.isDoctor) {
      this.doctorService.getMe().subscribe({
        next: (d) => { 
          this.me = d; 
          console.log('Doctor profile loaded:', d);
          this.isLoading = false;
          this.startRealTimeUpdates();
        },
        error: (err) => {
          console.error('Error loading doctor profile:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message
          });
          this.isLoading = false;
        },
      });
    } else {
      this.patientService.getMe().subscribe({
        next: (p) => { 
          this.me = p;
          console.log('Patient profile loaded:', p);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading patient profile:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message
          });
          this.isLoading = false;
        },
      });
    }
  }

  private startRealTimeUpdates() {
    if (!this.isDoctor) return;
    
    // Load initial data
    this.loadRealTimeData();
    
    // Set up auto-refresh every 30 seconds
    this.isRealTimeActive = true;
    this.refreshSubscription = interval(30000) // 30 seconds
      .pipe(
        startWith(0), // Start immediately
        switchMap(() => this.loadRealTimeDataObservable())
      )
      .subscribe({
        next: (data) => {
          this.processRealTimeData(data);
          this.lastUpdateTime = new Date();
        },
        error: (err) => {
          console.error('Error in real-time update:', err);
        }
      });
  }

  private loadRealTimeData() {
    this.loadRealTimeDataObservable().subscribe({
      next: (data) => {
        this.processRealTimeData(data);
        this.lastUpdateTime = new Date();
      },
      error: (err) => {
        console.error('Error loading real-time data:', err);
      }
    });
  }

  private loadRealTimeDataObservable() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's appointments
    const todayRequest = this.appointmentService.getMineForDoctor(today).pipe(
      catchError(() => of([] as Appointment[]))
    );
    
    // Get upcoming appointments (next 7 days)
    const upcomingRequests: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      upcomingRequests.push(
        this.appointmentService.getMineForDoctor(date).pipe(
          catchError(() => of([] as Appointment[]))
        )
      );
    }
    
    return forkJoin([todayRequest, ...upcomingRequests]).pipe(
      map((results) => {
        const todayApps = results[0];
        const allUpcoming = results.slice(1).flat();
        return { todayApps, allUpcoming };
      })
    );
  }

  private processRealTimeData(data: { todayApps: Appointment[]; allUpcoming: Appointment[] }) {
    const { todayApps, allUpcoming } = data;
    
    // Update today's appointments
    this.todayAppointments = todayApps;
    this.todayAppointmentsCount = todayApps.length;
    
    // Calculate stats
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    this.completedTodayCount = todayApps.filter(a => a.status === 'Completed').length;
    this.pendingAppointmentsCount = todayApps.filter(a => 
      a.status === 'Scheduled' || a.status === 'Checked-In'
    ).length;
    
    // Get upcoming appointments (future scheduled)
    const futureApps = allUpcoming.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= todayStart && apt.status === 'Scheduled';
    });
    
    this.upcomingAppointmentsCount = futureApps.length;
    
    // Find next appointment
    const sortedUpcoming = futureApps.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
      const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    this.nextAppointment = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;
    
    // Check for new appointments and show notifications
    this.checkForNewAppointments(todayApps.concat(futureApps));
  }

  private checkForNewAppointments(appointments: Appointment[]) {
    const currentIds = new Set(appointments.map(a => a.id).filter(id => id !== undefined) as number[]);
    
    // Find new appointments
    const newAppointments = appointments.filter(a => 
      a.id && !this.previousAppointmentIds.has(a.id)
    );
    
    if (newAppointments.length > 0 && this.previousAppointmentIds.size > 0) {
      // Show notification for new appointments
      newAppointments.forEach(apt => {
        if (apt.id) {
          const patientName = apt.patientName || 'Patient';
          const time = apt.startTime?.substring(0, 5) || '';
          this.toastService.info(`New appointment: ${patientName} at ${time}`);
        }
      });
    }
    
    this.previousAppointmentIds = currentIds;
  }

  getNextAppointmentTime(): string {
    if (!this.nextAppointment) return 'No upcoming appointments';
    
    const aptDate = new Date(this.nextAppointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    aptDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${this.nextAppointment.startTime?.substring(0, 5) || ''}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${this.nextAppointment.startTime?.substring(0, 5) || ''}`;
    } else {
      const dateStr = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${dateStr} at ${this.nextAppointment.startTime?.substring(0, 5) || ''}`;
    }
  }

  getLastUpdateTime(): string {
    if (!this.lastUpdateTime) return '';
    const diff = Math.floor((new Date().getTime() - this.lastUpdateTime.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return this.lastUpdateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }

  get patient(): Patient | null {
    return this.isDoctor ? null : (this.me as Patient);
  }

  get doctor(): Doctor | null {
    return this.isDoctor ? (this.me as Doctor) : null;
  }
}

