export interface Queue {
  id: number;
  appointmentId: number;
  doctorId: number;
  patientId: number;
  queueNumber: number;
  status: 'Waiting' | 'InProgress' | 'Completed' | 'Skipped' | 'Cancelled';
  queueDate: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedWaitTimeMinutes: number;
  actualWaitTimeMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentReason: string;
  appointmentTime: string;
}

export interface CreateQueueRequest {
  appointmentId: number;
  doctorId: number;
  patientId: number;
  queueDate: string;
}

export interface UpdateQueueStatusRequest {
  status: string;
  notes?: string;
}

export interface ReorderQueueRequest {
  queueIds: number[];
}

