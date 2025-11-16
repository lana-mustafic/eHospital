export interface Appointment {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes?: string;
  doctorId: number;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
}

export interface CreateAppointmentRequest {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  patientId: number;
  doctorId: number;
}

export interface UpdateAppointmentStatusRequest {
  status: string;
  notes?: string;
}

