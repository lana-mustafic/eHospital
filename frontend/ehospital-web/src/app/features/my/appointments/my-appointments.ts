import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Appointment } from '../../appointments/models/appointment.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-appointments.html',
  styleUrls: ['./my-appointments.scss']
})
export class MyAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading = false;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.appointmentService.getMine().subscribe({
      next: (list) => { this.appointments = list; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}

