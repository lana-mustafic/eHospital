import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../features/appointments/services/appointment.service';
import { Appointment } from '../../../features/appointments/models/appointment.model';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-reminders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-reminders.component.html',
  styleUrls: ['./appointment-reminders.component.scss']
})
export class AppointmentRemindersComponent implements OnInit {
  @Input() daysAhead: number = 7;
  @Input() maxItems: number = 5;
  @Input() showForCurrentUser: boolean = false;
  
  upcomingAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading = false;
  isDoctor = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDoctor = this.authService.hasRole('Doctor');
    this.loadReminders();
  }

  loadReminders(): void {
    this.isLoading = true;
    
    if (this.showForCurrentUser) {
      // For patients and doctors, use their respective endpoints
      const currentUser = this.authService.getCurrentUser();
      const role = currentUser?.role?.toLowerCase();
      
      if (role === 'patient') {
        this.appointmentService.getMine().subscribe({
          next: (appointments) => {
            // Filter to only upcoming appointments
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + this.daysAhead);
            
            this.upcomingAppointments = appointments.filter(apt => {
              const aptDate = new Date(apt.appointmentDate);
              aptDate.setHours(0, 0, 0, 0);
              return aptDate >= today && 
                     aptDate <= futureDate && 
                     apt.status === 'Scheduled';
            }).sort((a, b) => {
              const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
              const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
              return dateA.getTime() - dateB.getTime();
            });
            
            this.filteredAppointments = this.upcomingAppointments.slice(0, this.maxItems);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        return;
      } else if (role === 'doctor') {
        // For doctors, get their appointments for the next N days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + this.daysAhead);
        futureDate.setHours(23, 59, 59, 999);
        
        // Get appointments for each day in the range
        const requests: any[] = [];
        for (let d = new Date(today); d <= futureDate; d.setDate(d.getDate() + 1)) {
          const dateStr = new Date(d);
          requests.push(
            this.appointmentService.getMineForDoctor(dateStr).pipe(
              catchError(() => of([]))
            )
          );
        }
        
        if (requests.length === 0) {
          this.isLoading = false;
          return;
        }
        
        forkJoin(requests).subscribe({
          next: (allAppointments: Appointment[][]) => {
            const flattened = allAppointments.flat();
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            this.upcomingAppointments = flattened.filter(apt => {
              const aptDate = new Date(apt.appointmentDate);
              aptDate.setHours(0, 0, 0, 0);
              return aptDate >= todayStart && 
                     aptDate <= futureDate && 
                     apt.status === 'Scheduled';
            }).sort((a, b) => {
              const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
              const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
              return dateA.getTime() - dateB.getTime();
            });
            
            this.filteredAppointments = this.upcomingAppointments.slice(0, this.maxItems);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
        return;
      }
    }
    
    // For staff or when not filtering by user, use getUpcoming
    this.appointmentService.getUpcoming(this.daysAhead).subscribe({
      next: (appointments) => {
        this.upcomingAppointments = appointments;
        this.filteredAppointments = this.upcomingAppointments.slice(0, this.maxItems);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getDaysUntil(appointment: Appointment): number {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getReminderText(appointment: Appointment): string {
    const days = this.getDaysUntil(appointment);
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Tomorrow';
    } else if (days < 7) {
      return `In ${days} days`;
    } else {
      const weeks = Math.floor(days / 7);
      return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
  }

  getReminderClass(appointment: Appointment): string {
    const days = this.getDaysUntil(appointment);
    if (days === 0) {
      return 'urgent';
    } else if (days <= 2) {
      return 'soon';
    } else {
      return 'upcoming';
    }
  }

  formatDateTime(appointment: Appointment): string {
    const date = new Date(appointment.appointmentDate);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = appointment.startTime.substring(0, 5);
    return `${dateStr} at ${timeStr}`;
  }

  navigateToAppointments(): void {
    this.router.navigate(['/appointments']);
  }
}

