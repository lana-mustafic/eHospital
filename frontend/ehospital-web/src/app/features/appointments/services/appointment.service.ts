import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointments}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    // Mock data for development - replace with real API call when backend is ready
    return this.getMockAppointments();
    
    // Uncomment when backend is ready:
    // return this.http.get<Appointment[]>(this.apiUrl);
  }

  getById(id: string): Observable<Appointment> {
    // Mock implementation
    const mockData = this.getMockDataArray();
    const appointment = mockData.find(a => a.id === id);
    return of(appointment || mockData[0]).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  create(appointment: Appointment): Observable<Appointment> {
    // Mock implementation
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return of(newAppointment).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  update(id: string, appointment: Appointment): Observable<Appointment> {
    // Mock implementation
    const updatedAppointment: Appointment = {
      ...appointment,
      id,
      updatedAt: new Date().toISOString()
    };
    return of(updatedAppointment).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  delete(id: string): Observable<void> {
    // Mock implementation
    return of(undefined).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Mock data for development
  private getMockDataArray(): Appointment[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: '1',
        patientId: '1',
        patientName: 'John Doe',
        doctorId: '1',
        doctorName: 'Dr. John Smith',
        appointmentDate: tomorrow.toISOString().split('T')[0],
        appointmentTime: '10:00',
        duration: 30,
        status: 'Scheduled',
        appointmentType: 'Consultation',
        reason: 'Routine check-up',
        notes: 'Patient requested morning appointment',
        department: 'Cardiology',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'Sarah Smith',
        doctorId: '2',
        doctorName: 'Dr. Sarah Johnson',
        appointmentDate: today.toISOString().split('T')[0],
        appointmentTime: '14:30',
        duration: 45,
        status: 'Completed',
        appointmentType: 'Follow-up',
        reason: 'Post-treatment review',
        notes: 'Patient responded well to treatment',
        department: 'Pediatrics',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-14T14:30:00Z'
      },
      {
        id: '3',
        patientId: '3',
        patientName: 'Michael Johnson',
        doctorId: '3',
        doctorName: 'Dr. Michael Brown',
        appointmentDate: nextWeek.toISOString().split('T')[0],
        appointmentTime: '09:00',
        duration: 60,
        status: 'Scheduled',
        appointmentType: 'Check-up',
        reason: 'Annual physical examination',
        notes: '',
        department: 'Emergency Medicine',
        createdAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z'
      }
    ];
  }

  private getMockAppointments(): Observable<Appointment[]> {
    return of(this.getMockDataArray()).pipe(delay(500));
  }
}

