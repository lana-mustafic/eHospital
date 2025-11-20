import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { QueueService } from '../../queues/services/queue.service';
import { PatientService } from '../../patients/services/patient.service';
import { DepartmentService } from '../../departments/services/department.service';
import { DoctorService } from '../../doctors/services/doctor.service';
import { Appointment } from '../../appointments/models/appointment.model';
import { Queue } from '../../queues/models/queue.model';
import { Doctor } from '../../doctors/models/doctor.model';
import { Department } from '../../departments/models/department.model';
import {
  AverageWaitTime,
  PatientSatisfaction,
  ReadmissionRate,
  DepartmentUtilization,
  StaffProductivity,
  MetricsSummary
} from '../models/metrics.model';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  constructor(
    private appointmentService: AppointmentService,
    private queueService: QueueService,
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private doctorService: DoctorService
  ) {}

  getMetricsSummary(): Observable<MetricsSummary> {
    return forkJoin({
      appointments: this.appointmentService.getAll().pipe(catchError(() => of([]))),
      queues: this.queueService.getAllQueues().pipe(catchError(() => of([]))),
      doctors: this.doctorService.getAll().pipe(catchError(() => of([]))),
      departments: this.departmentService.getAll().pipe(catchError(() => of([]))),
      patients: this.patientService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const appointments = data.appointments as Appointment[];
        const queues = data.queues as Queue[];
        const doctors = data.doctors as Doctor[];
        const departments = data.departments as Department[];

        return {
          averageWaitTime: this.calculateAverageWaitTime(queues, appointments, doctors, departments),
          patientSatisfaction: this.calculatePatientSatisfaction(),
          readmissionRate: this.calculateReadmissionRate(),
          departmentUtilization: this.calculateDepartmentUtilization(appointments, departments),
          staffProductivity: this.calculateStaffProductivity(appointments, doctors, queues),
          lastUpdated: new Date().toISOString()
        };
      })
    );
  }

  private calculateAverageWaitTime(
    queues: Queue[],
    appointments: Appointment[],
    doctors: Doctor[],
    departments: Department[]
  ): AverageWaitTime {
    // Calculate overall average wait time from queues
    const completedQueues = queues.filter(q => q.status === 'Completed' && q.actualWaitTimeMinutes > 0);
    const overall = completedQueues.length > 0
      ? completedQueues.reduce((sum, q) => sum + q.actualWaitTimeMinutes, 0) / completedQueues.length
      : 0;

    // Calculate by department
    const byDepartment = departments.map(dept => {
      const deptDoctors = doctors.filter(d => d.departmentName === dept.name);
      const deptDoctorIds = deptDoctors.map(d => d.id);
      const deptQueues = completedQueues.filter(q => deptDoctorIds.includes(q.doctorId));
      const avgWait = deptQueues.length > 0
        ? deptQueues.reduce((sum, q) => sum + q.actualWaitTimeMinutes, 0) / deptQueues.length
        : 0;
      return {
        department: dept.name,
        averageWaitTime: Math.round(avgWait)
      };
    });

    // Calculate by doctor
    const byDoctor = doctors.map(doctor => {
      const doctorQueues = completedQueues.filter(q => q.doctorId === doctor.id);
      const avgWait = doctorQueues.length > 0
        ? doctorQueues.reduce((sum, q) => sum + q.actualWaitTimeMinutes, 0) / doctorQueues.length
        : 0;
      return {
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        averageWaitTime: Math.round(avgWait)
      };
    }).filter(d => d.averageWaitTime > 0);

    // Calculate trend (last 7 days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayQueues = completedQueues.filter(q => {
        const queueDate = new Date(q.queueDate).toISOString().split('T')[0];
        return queueDate === dateStr;
      });
      const avgWait = dayQueues.length > 0
        ? dayQueues.reduce((sum, q) => sum + q.actualWaitTimeMinutes, 0) / dayQueues.length
        : 0;
      trend.push({
        date: dateStr,
        averageWaitTime: Math.round(avgWait)
      });
    }

    return {
      overall: Math.round(overall),
      byDepartment,
      byDoctor,
      trend
    };
  }

  private calculatePatientSatisfaction(): PatientSatisfaction {
    // Mock data - in real implementation, this would come from a satisfaction survey system
    const mockSatisfaction = {
      overall: 87,
      averageRating: 4.3,
      totalResponses: 245,
      byDepartment: [
        { department: 'Cardiology', score: 92, averageRating: 4.6, responseCount: 45 },
        { department: 'Neurology', score: 88, averageRating: 4.4, responseCount: 38 },
        { department: 'Pediatrics', score: 91, averageRating: 4.5, responseCount: 52 },
        { department: 'Emergency', score: 82, averageRating: 4.1, responseCount: 67 },
        { department: 'General Medicine', score: 85, averageRating: 4.2, responseCount: 43 }
      ],
      byCategory: {
        service: 89,
        cleanliness: 91,
        communication: 86,
        waitTime: 81,
        overall: 87
      },
      trend: [
        { month: 'Jan', score: 84 },
        { month: 'Feb', score: 85 },
        { month: 'Mar', score: 86 },
        { month: 'Apr', score: 87 },
        { month: 'May', score: 88 },
        { month: 'Jun', score: 87 }
      ]
    };

    return mockSatisfaction;
  }

  private calculateReadmissionRate(): ReadmissionRate {
    // Mock data - in real implementation, this would analyze discharge and readmission records
    const mockReadmission = {
      overall: 8.5,
      within30Days: 6.2,
      within90Days: 8.5,
      byDepartment: [
        { department: 'Cardiology', rate: 12.5, count: 15, totalDischarges: 120 },
        { department: 'Surgery', rate: 9.8, count: 22, totalDischarges: 224 },
        { department: 'Emergency', rate: 7.3, count: 18, totalDischarges: 247 },
        { department: 'Pediatrics', rate: 5.1, count: 8, totalDischarges: 157 },
        { department: 'General Medicine', rate: 6.8, count: 12, totalDischarges: 176 }
      ],
      byDiagnosis: [
        { diagnosis: 'Heart Failure', rate: 15.2, count: 12 },
        { diagnosis: 'Pneumonia', rate: 11.8, count: 9 },
        { diagnosis: 'Diabetes', rate: 8.5, count: 7 },
        { diagnosis: 'COPD', rate: 13.4, count: 10 }
      ],
      trend: [
        { month: 'Jan', rate: 9.2 },
        { month: 'Feb', rate: 8.8 },
        { month: 'Mar', rate: 8.5 },
        { month: 'Apr', rate: 8.3 },
        { month: 'May', rate: 8.6 },
        { month: 'Jun', rate: 8.5 }
      ]
    };

    return mockReadmission;
  }

  private calculateDepartmentUtilization(
    appointments: Appointment[],
    departments: Department[]
  ): DepartmentUtilization[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);

    return departments.map(dept => {
      // Get appointments for this department (via doctors)
      const deptAppointments = todayAppointments.filter(a => {
        // In real implementation, we'd check doctor's department
        return true; // Simplified for now
      });

      const totalCapacity = 40; // Assume 40 appointment slots per day per department
      const currentUsage = deptAppointments.length;
      const utilizationRate = (currentUsage / totalCapacity) * 100;

      // Calculate by time slot
      const timeSlots = ['08:00-12:00', '12:00-16:00', '16:00-20:00'];
      const byTimeSlot = timeSlots.map(slot => {
        const [start, end] = slot.split('-');
        const slotAppointments = deptAppointments.filter(a => {
          const aptTime = a.startTime.substring(0, 5);
          return aptTime >= start && aptTime < end;
        });
        return {
          timeSlot: slot,
          utilizationRate: (slotAppointments.length / (totalCapacity / 3)) * 100
        };
      });

      // Find peak hours
      const hourCounts: { [hour: string]: number } = {};
      deptAppointments.forEach(apt => {
        const hour = apt.startTime.substring(0, 2);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => `${hour}:00`);

      return {
        department: dept.name,
        utilizationRate: Math.round(utilizationRate),
        totalCapacity,
        currentUsage,
        appointments: deptAppointments.length,
        procedures: 0, // Would come from procedure records
        byTimeSlot,
        peakHours
      };
    });
  }

  private calculateStaffProductivity(
    appointments: Appointment[],
    doctors: Doctor[],
    queues: Queue[]
  ): StaffProductivity[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
    const completedQueues = queues.filter(q => q.status === 'Completed');

    return doctors.map(doctor => {
      const doctorAppointments = todayAppointments.filter(a => a.doctorId === doctor.id);
      const doctorQueues = completedQueues.filter(q => q.doctorId === doctor.id);
      
      const appointmentsPerDay = doctorAppointments.length;
      const patientsSeen = doctorQueues.length;
      
      // Calculate average consultation time (mock - would come from actual data)
      const avgConsultationTime = doctorQueues.length > 0
        ? doctorQueues.reduce((sum, q) => {
            const waitTime = q.actualWaitTimeMinutes || 0;
            return sum + (waitTime > 0 ? Math.min(waitTime, 60) : 30); // Assume 30 min default
          }, 0) / doctorQueues.length
        : 30;

      const completedAppointments = doctorAppointments.filter(a => a.status === 'Completed').length;
      const completionRate = doctorAppointments.length > 0
        ? (completedAppointments / doctorAppointments.length) * 100
        : 0;

      // Mock patient satisfaction for this doctor
      const patientSatisfaction = 85 + Math.random() * 10;

      // Calculate efficiency score (combination of factors)
      const efficiencyScore = Math.round(
        (completionRate * 0.4) +
        (patientSatisfaction * 0.3) +
        ((appointmentsPerDay / 20) * 100 * 0.3) // Normalize to 20 appointments per day
      );

      // Calculate by month (last 6 months)
      const byMonth = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short' });
        byMonth.push({
          month: monthStr,
          appointments: Math.floor(Math.random() * 50) + 20,
          patientsSeen: Math.floor(Math.random() * 45) + 18,
          efficiencyScore: Math.floor(Math.random() * 20) + 75
        });
      }

      return {
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        department: doctor.specialization || 'General',
        appointmentsPerDay,
        patientsSeen,
        averageConsultationTime: Math.round(avgConsultationTime),
        completionRate: Math.round(completionRate),
        patientSatisfaction: Math.round(patientSatisfaction),
        efficiencyScore: Math.min(100, Math.max(0, efficiencyScore)),
        byMonth
      };
    }).filter(d => d.appointmentsPerDay > 0 || d.patientsSeen > 0);
  }
}

