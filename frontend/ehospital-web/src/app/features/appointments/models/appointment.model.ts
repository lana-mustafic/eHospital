export interface Appointment {
  id?: string;
  patientId: string;
  patientName?: string; // For display purposes
  doctorId: string;
  doctorName?: string; // For display purposes
  appointmentDate: string; // ISO date string
  appointmentTime: string; // Time string (HH:mm)
  duration?: number; // Duration in minutes
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  appointmentType?: string; // e.g., 'Consultation', 'Follow-up', 'Check-up'
  reason?: string;
  notes?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  appointmentType: string;
  reason: string;
  notes: string;
}

