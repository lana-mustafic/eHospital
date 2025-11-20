export interface AverageWaitTime {
  overall: number; // in minutes
  byDepartment: Array<{
    department: string;
    averageWaitTime: number;
  }>;
  byDoctor: Array<{
    doctorId: number;
    doctorName: string;
    averageWaitTime: number;
  }>;
  trend: Array<{
    date: string;
    averageWaitTime: number;
  }>;
}

export interface PatientSatisfaction {
  overall: number; // 0-100 score
  averageRating: number; // 1-5 stars
  totalResponses: number;
  byDepartment: Array<{
    department: string;
    score: number;
    averageRating: number;
    responseCount: number;
  }>;
  byCategory: {
    service: number;
    cleanliness: number;
    communication: number;
    waitTime: number;
    overall: number;
  };
  trend: Array<{
    month: string;
    score: number;
  }>;
}

export interface ReadmissionRate {
  overall: number; // percentage
  within30Days: number;
  within90Days: number;
  byDepartment: Array<{
    department: string;
    rate: number;
    count: number;
    totalDischarges: number;
  }>;
  byDiagnosis: Array<{
    diagnosis: string;
    rate: number;
    count: number;
  }>;
  trend: Array<{
    month: string;
    rate: number;
  }>;
}

export interface DepartmentUtilization {
  department: string;
  utilizationRate: number; // percentage
  totalCapacity: number;
  currentUsage: number;
  appointments: number;
  procedures: number;
  byTimeSlot: Array<{
    timeSlot: string;
    utilizationRate: number;
  }>;
  peakHours: string[];
}

export interface StaffProductivity {
  doctorId: number;
  doctorName: string;
  department: string;
  appointmentsPerDay: number;
  patientsSeen: number;
  averageConsultationTime: number; // in minutes
  completionRate: number; // percentage
  patientSatisfaction: number;
  efficiencyScore: number; // 0-100
  byMonth: Array<{
    month: string;
    appointments: number;
    patientsSeen: number;
    efficiencyScore: number;
  }>;
}

export interface MetricsSummary {
  averageWaitTime: AverageWaitTime;
  patientSatisfaction: PatientSatisfaction;
  readmissionRate: ReadmissionRate;
  departmentUtilization: DepartmentUtilization[];
  staffProductivity: StaffProductivity[];
  lastUpdated: string;
}

