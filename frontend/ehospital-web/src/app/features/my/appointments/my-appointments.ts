import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Appointment } from '../../appointments/models/appointment.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-appointments.html',
  styleUrls: ['./my-appointments.scss']
})
export class MyAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading = false;
  showReschedule = false;
  selectedAppointmentId: number | null = null;
  rescheduleDate = '';
  rescheduleStart = '';
  rescheduleEnd = '';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.appointmentService.getMine().subscribe({
      next: (list) => { this.appointments = list; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  cancel(a: Appointment) {
    if (!a.id) return;
    if (!confirm('Cancel this appointment?')) return;
    this.appointmentService.cancelMine(a.id).subscribe({
      next: () => {
        this.appointmentService.getMine().subscribe({ next: l => this.appointments = l });
      }
    });
  }

  openReschedule(a: Appointment) {
    if (!a.id) return;
    this.selectedAppointmentId = a.id;
    this.rescheduleDate = a.appointmentDate;
    this.rescheduleStart = a.startTime.length === 5 ? a.startTime : a.startTime.slice(0,5);
    this.rescheduleEnd = a.endTime.length === 5 ? a.endTime : a.endTime.slice(0,5);
    this.showReschedule = true;
  }

  closeReschedule() {
    this.showReschedule = false;
    this.selectedAppointmentId = null;
  }

  submitReschedule() {
    if (!this.selectedAppointmentId) return;
    const payload = {
      appointmentDate: this.rescheduleDate,
      startTime: this.normalize(this.rescheduleStart),
      endTime: this.normalize(this.rescheduleEnd)
    };
    this.appointmentService.rescheduleMine(this.selectedAppointmentId, payload).subscribe({
      next: () => {
        this.closeReschedule();
        this.appointmentService.getMine().subscribe({ next: l => this.appointments = l });
      }
    });
  }

  private normalize(t: string): string {
    return t.length === 5 ? `${t}:00` : t;
  }
}

