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
import { Subscription, filter, take } from 'rxjs';

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
  private userSubscription?: Subscription;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    public authService: AuthService
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
  }

  private load() {
    this.isLoading = true;
    
    if (this.isDoctor) {
      this.doctorService.getMe().subscribe({
        next: (d) => { 
          this.me = d; 
          console.log('Doctor profile loaded:', d);
          this.isLoading = false;
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

  get patient(): Patient | null {
    return this.isDoctor ? null : (this.me as Patient);
  }

  get doctor(): Doctor | null {
    return this.isDoctor ? (this.me as Doctor) : null;
  }
}

