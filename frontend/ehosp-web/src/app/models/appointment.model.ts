export interface Appointment {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes?: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
}

export interface CreateAppointment {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  patientId: number;
  doctorId: number;
}