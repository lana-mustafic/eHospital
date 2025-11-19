import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Appointment } from '../../appointments/models/appointment.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

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
  rescheduleDoctorId: number | null = null;
  slots: { start: string; end: string; available: boolean }[] = [];
  isDoctor = false;
  selectedDate: Date = new Date();

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isDoctor = this.authService.hasRole('Doctor');
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    if (this.isDoctor) {
      this.appointmentService.getMineForDoctor(this.selectedDate).subscribe({
        next: (list) => { this.appointments = list; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.appointmentService.getMine().subscribe({
        next: (list) => { this.appointments = list; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    }
  }

  onDateFilterChange(date: string) {
    if (date) {
      this.selectedDate = new Date(date);
      this.loadAppointments();
    }
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
    this.rescheduleDoctorId = a.doctorId || null;
    this.showReschedule = true;
    this.loadSlots();
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

  onDateChange() {
    this.loadSlots();
  }

  selectSlot(slot: { start: string; end: string; available: boolean }) {
    if (!slot.available) return;
    this.rescheduleStart = slot.start;
    this.rescheduleEnd = slot.end;
  }

  private loadSlots() {
    if (!this.rescheduleDoctorId || !this.rescheduleDate) {
      this.slots = [];
      return;
    }
    const startHour = 8;
    const endHour = 17;
    const stepMinutes = 30;
    const temp: { start: string; end: string; available: boolean }[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const start = `${('0'+h).slice(-2)}:${('0'+m).slice(-2)}:00`;
        const endDate = new Date(0,0,0,h,m + stepMinutes);
        const end = `${('0'+endDate.getHours()).slice(-2)}:${('0'+endDate.getMinutes()).slice(-2)}:00`;
        temp.push({ start, end, available: false });
      }
    }
    this.slots = temp;
    // Check availability per slot (simple sequential requests)
    temp.forEach((s, idx) => {
      this.appointmentService.isAvailable(this.rescheduleDoctorId!, this.rescheduleDate, s.start, s.end)
        .subscribe({ next: (ok) => { this.slots[idx].available = ok; } });
    });
  }
}

