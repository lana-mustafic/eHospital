import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueueService } from './services/queue.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { AppointmentService } from '../appointments/services/appointment.service';
import { Queue, UpdateQueueStatusRequest } from './models/queue.model';
import { Doctor } from '../doctors/models/doctor.model';
import { Appointment } from '../appointments/models/appointment.model';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-queues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './queues.html',
  styleUrls: ['./queues.scss']
})
export class QueuesComponent implements OnInit, OnDestroy {
  queues: Queue[] = [];
  filteredQueues: Queue[] = [];
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  selectedDoctorId: number | null = null;
  selectedDate: Date = new Date();
  isLoading = false;
  viewMode: 'management' | 'display' = 'management';
  autoRefresh = true;
  private refreshSubscription?: Subscription;

  constructor(
    private queueService: QueueService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadDoctors();
    this.loadQueues();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  loadQueues() {
    this.isLoading = true;
    const date = this.selectedDate;
    
    const request = this.selectedDoctorId
      ? this.queueService.getQueuesByDoctor(this.selectedDoctorId, date)
      : this.queueService.getAllQueues(undefined, date);

    request.subscribe({
      next: (queues) => {
        this.queues = queues;
        this.filteredQueues = queues;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading queues:', error);
        this.toastService.error('Failed to load queues');
        this.isLoading = false;
      }
    });
  }

  onDoctorChange() {
    this.loadQueues();
  }

  onDateChange() {
    this.loadQueues();
  }

  callNextPatient(doctorId: number) {
    this.queueService.callNextPatient(doctorId).subscribe({
      next: (queue) => {
        this.toastService.success(`Called patient: ${queue.patientName}`);
        this.loadQueues();
      },
      error: (error) => {
        console.error('Error calling next patient:', error);
        this.toastService.error('Failed to call next patient');
      }
    });
  }

  updateQueueStatus(queue: Queue, status: string) {
    const update: UpdateQueueStatusRequest = { status };
    this.queueService.updateQueueStatus(queue.id, update).subscribe({
      next: () => {
        this.toastService.success('Queue status updated');
        this.loadQueues();
      },
      error: (error) => {
        console.error('Error updating queue status:', error);
        this.toastService.error('Failed to update queue status');
      }
    });
  }

  skipQueue(queue: Queue) {
    this.queueService.skipQueue(queue.id).subscribe({
      next: () => {
        this.toastService.success('Queue skipped');
        this.loadQueues();
      },
      error: (error) => {
        console.error('Error skipping queue:', error);
        this.toastService.error('Failed to skip queue');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Waiting':
        return 'status-waiting';
      case 'InProgress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      case 'Skipped':
        return 'status-skipped';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getQueuesByDoctor(doctorId: number): Queue[] {
    return this.filteredQueues.filter(q => q.doctorId === doctorId);
  }

  getWaitingCount(doctorId: number): number {
    return this.getQueuesByDoctor(doctorId).filter(q => q.status === 'Waiting').length;
  }

  formatWaitTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'management' ? 'display' : 'management';
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  private startAutoRefresh() {
    if (this.autoRefresh && !this.refreshSubscription) {
      this.refreshSubscription = interval(10000).subscribe(() => {
        this.loadQueues();
      });
    }
  }

  private stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  getCurrentPatient(doctorId: number): Queue | undefined {
    return this.getQueuesByDoctor(doctorId).find(q => q.status === 'InProgress');
  }

  getNextPatient(doctorId: number): Queue | undefined {
    return this.getQueuesByDoctor(doctorId)
      .filter(q => q.status === 'Waiting')
      .sort((a, b) => a.queueNumber - b.queueNumber)[0];
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

