import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../patients/services/patient.service';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Patient } from '../../patients/models/patient.model';
import { Appointment } from '../../appointments/models/appointment.model';
import { AppointmentRemindersComponent } from '../../../shared/components/appointment-reminders/appointment-reminders.component';

@Component({
  selector: 'app-my-home',
  standalone: true,
  imports: [CommonModule, AppointmentRemindersComponent],
  templateUrl: './my-home.html',
  styleUrls: ['./my-home.scss']
})
export class MyHomeComponent implements OnInit {
  me: Patient | null = null;
  upcoming: Appointment[] = [];
  isLoading = false;

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.isLoading = true;
    this.patientService.getMe().subscribe({
      next: (p) => { this.me = p; },
      error: () => {},
    });
    this.appointmentService.getMine().subscribe({
      next: (list) => {
        const today = new Date();
        this.upcoming = list
          .filter(a => new Date(a.appointmentDate) >= new Date(today.toDateString()))
          .slice(0, 5);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
}

