import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StatusPieChartComponent } from '../../shared/components/charts/status-pie-chart/status-pie-chart.component';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { AppointmentService } from '../appointments/services/appointment.service';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { MedicalRecordService } from '../medical-records/services/medical-record.service';
import { DiagnosisService } from '../diagnoses/services/diagnosis.service';
import { PrescriptionService } from '../prescriptions/services/prescription.service';
import { MedicationService, Medication } from '../medications/services/medication.service';
import { Appointment } from '../appointments/models/appointment.model';
import { Patient } from '../patients/models/patient.model';
import { Doctor } from '../doctors/models/doctor.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExportService } from '../../core/services/export.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StatusPieChartComponent,
    LineChartComponent,
    BarChartComponent
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class Reports implements OnInit {
  filterForm: FormGroup;
  selectedReportType: 'appointments' | 'patients' | 'doctors' | 'medications' | 'overview' = 'overview';
  
  // Data
  appointments: Appointment[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  medications: Medication[] = [];
  medicalRecords: any[] = [];
  diagnoses: any[] = [];
  prescriptions: any[] = [];
  
  // Filtered data
  filteredAppointments: Appointment[] = [];
  
  // Chart data
  appointmentStatusData = { scheduled: 0, completed: 0, cancelled: 0, noShow: 0 };
  appointmentTrendData: Array<{ label: string; value: number }> = [];
  doctorAppointmentData: Array<{ label: string; value: number; color?: string }> = [];
  patientAgeDistributionData: Array<{ label: string; value: number; color?: string }> = [];
  monthlyAppointmentData: Array<{ label: string; value: number; color?: string }> = [];
  medicationUsageData: Array<{ label: string; value: number; color?: string }> = [];
  medicationFormData: Array<{ label: string; value: number; color?: string }> = [];
  lowStockMedications: Medication[] = [];
  
  // Statistics
  totalAppointments = 0;
  totalPatients = 0;
  totalDoctors = 0;
  totalMedications = 0;
  totalMedicalRecords = 0;
  totalDiagnoses = 0;
  totalPrescriptions = 0;
  averageAppointmentsPerDay = 0;
  completionRate = 0;
  cancellationRate = 0;
  totalMedicationValue = 0;
  lowStockCount = 0;
  
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private medicalRecordService: MedicalRecordService,
    private diagnosisService: DiagnosisService,
    private prescriptionService: PrescriptionService,
    private medicationService: MedicationService,
    private exportService: ExportService,
    private toastService: ToastService
  ) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    this.filterForm = this.fb.group({
      startDate: [lastMonth.toISOString().split('T')[0]],
      endDate: [today.toISOString().split('T')[0]],
      reportType: ['overview']
    });
  }

  ngOnInit(): void {
    this.loadReportsData();
    this.filterForm.get('reportType')?.valueChanges.subscribe(type => {
      this.selectedReportType = type;
      this.applyFilters();
    });
  }

  loadReportsData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      appointments: this.appointmentService.getAll().pipe(catchError(() => of([]))),
      patients: this.patientService.getAll().pipe(catchError(() => of([]))),
      doctors: this.doctorService.getAll().pipe(catchError(() => of([]))),
      medicalRecords: this.medicalRecordService.getAll().pipe(catchError(() => of([]))),
      diagnoses: this.diagnosisService.getAll().pipe(catchError(() => of([]))),
      prescriptions: this.prescriptionService.getAll().pipe(catchError(() => of([]))),
      medications: this.medicationService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.appointments = data.appointments;
        this.patients = data.patients;
        this.doctors = data.doctors;
        this.medications = data.medications;
        this.medicalRecords = data.medicalRecords;
        this.diagnoses = data.diagnoses;
        this.prescriptions = data.prescriptions;
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports data:', error);
        this.error = 'Failed to load reports data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    // Filter appointments by date range
    this.filteredAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return aptDate >= start && aptDate <= end;
    });
    
    // Calculate statistics
    this.calculateStatistics();
    this.calculateChartData();
  }

  calculateStatistics(): void {
    this.totalAppointments = this.filteredAppointments.length;
    this.totalPatients = this.patients.length;
    this.totalDoctors = this.doctors.length;
    this.totalMedications = this.medications.length;
    this.totalMedicalRecords = this.medicalRecords.length;
    this.totalDiagnoses = this.diagnoses.length;
    this.totalPrescriptions = this.prescriptions.length;
    
    // Medication statistics
    this.totalMedicationValue = this.medications.reduce((sum, med) => sum + (med.price * med.stockQuantity), 0);
    this.lowStockMedications = this.medications.filter(med => med.stockQuantity < 10 && med.isActive);
    this.lowStockCount = this.lowStockMedications.length;
    
    // Status breakdown
    this.appointmentStatusData = {
      scheduled: this.filteredAppointments.filter(a => a.status === 'Scheduled').length,
      completed: this.filteredAppointments.filter(a => a.status === 'Completed').length,
      cancelled: this.filteredAppointments.filter(a => a.status === 'Cancelled').length,
      noShow: this.filteredAppointments.filter(a => a.status === 'No Show').length
    };
    
    // Calculate rates
    if (this.totalAppointments > 0) {
      this.completionRate = (this.appointmentStatusData.completed / this.totalAppointments) * 100;
      this.cancellationRate = (this.appointmentStatusData.cancelled / this.totalAppointments) * 100;
    }
    
    // Calculate average appointments per day
    const startDate = new Date(this.filterForm.get('startDate')?.value);
    const endDate = new Date(this.filterForm.get('endDate')?.value);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    this.averageAppointmentsPerDay = this.totalAppointments / daysDiff;
  }

  calculateChartData(): void {
    // Appointment trends
    this.calculateAppointmentTrends();
    
    // Doctor appointment distribution
    this.calculateDoctorAppointments();
    
    // Patient age distribution
    this.calculatePatientAgeDistribution();
    
    // Monthly appointments
    this.calculateMonthlyAppointments();
    
    // Medication analytics
    this.calculateMedicationUsage();
    this.calculateMedicationFormDistribution();
  }

  private calculateAppointmentTrends(): void {
    const startDate = new Date(this.filterForm.get('startDate')?.value);
    const endDate = new Date(this.filterForm.get('endDate')?.value);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const trendData: Array<{ label: string; value: number }> = [];
    const maxDays = Math.min(daysDiff, 30); // Show max 30 days
    
    for (let i = maxDays - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = this.filteredAppointments.filter(apt => apt.appointmentDate === dateStr).length;
      
      trendData.push({ label: dayLabel, value: count });
    }
    
    this.appointmentTrendData = trendData;
  }

  private calculateDoctorAppointments(): void {
    const doctorMap = new Map<string, number>();
    
    this.filteredAppointments.forEach(apt => {
      const doctorName = apt.doctorName || 'Unknown';
      doctorMap.set(doctorName, (doctorMap.get(doctorName) || 0) + 1);
    });
    
    this.doctorAppointmentData = Array.from(doctorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        label: name.length > 15 ? name.substring(0, 15) + '...' : name,
        value: count,
        color: '#667eea'
      }));
  }

  private calculatePatientAgeDistribution(): void {
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0
    };
    
    this.patients.forEach(patient => {
      const age = this.getAge(patient.dateOfBirth);
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['61+']++;
    });
    
    this.patientAgeDistributionData = Object.entries(ageGroups).map(([label, value]) => ({
      label,
      value,
      color: '#10b981'
    }));
  }

  private calculateMonthlyAppointments(): void {
    const monthlyMap = new Map<string, number>();
    
    this.filteredAppointments.forEach(apt => {
      const date = new Date(apt.appointmentDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });
    
    this.monthlyAppointmentData = Array.from(monthlyMap.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([label, value]) => ({
        label,
        value,
        color: '#f59e0b'
      }));
  }

  private calculateMedicationUsage(): void {
    // Get top medications by prescription count
    const medicationMap = new Map<string, number>();
    
    this.prescriptions.forEach(prescription => {
      const medName = prescription.medicationName || 'Unknown';
      medicationMap.set(medName, (medicationMap.get(medName) || 0) + 1);
    });
    
    this.medicationUsageData = Array.from(medicationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        label: name.length > 20 ? name.substring(0, 20) + '...' : name,
        value: count,
        color: '#8b5cf6'
      }));
  }

  private calculateMedicationFormDistribution(): void {
    const formMap = new Map<string, number>();
    
    this.medications.forEach(med => {
      const form = med.form || 'Unknown';
      formMap.set(form, (formMap.get(form) || 0) + 1);
    });
    
    this.medicationFormData = Array.from(formMap.entries())
      .map(([form, count]) => ({
        label: form,
        value: count,
        color: '#ec4899'
      }));
  }

  private getAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  exportReport(): void {
    const reportType = this.selectedReportType;
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';
    
    switch (reportType) {
      case 'appointments':
        data = this.filteredAppointments.map(apt => ({
          'Date': apt.appointmentDate,
          'Time': `${apt.startTime} - ${apt.endTime}`,
          'Patient': apt.patientName || '—',
          'Doctor': apt.doctorName || '—',
          'Status': apt.status,
          'Reason': apt.reason || '—',
          'Notes': apt.notes || '—'
        }));
        headers = ['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Reason', 'Notes'];
        filename = `appointments_${startDate}_to_${endDate}`;
        break;
      case 'patients':
        data = this.patients.map(p => ({
          'Name': `${p.firstName} ${p.lastName}`,
          'Gender': p.gender,
          'Age': this.getAge(p.dateOfBirth),
          'Email': p.email,
          'Phone': p.phoneNumber,
          'Blood Type': p.bloodType || '—'
        }));
        headers = ['Name', 'Gender', 'Age', 'Email', 'Phone', 'Blood Type'];
        filename = 'patients_report';
        break;
      case 'doctors':
        data = this.doctors.map(d => ({
          'Name': `${d.firstName} ${d.lastName}`,
          'Specialization': d.specialization,
          'Department': d.departmentName || '—',
          'Email': d.email || '—',
          'License Number': d.licenseNumber || '—',
          'Years of Experience': d.yearsOfExperience || 0
        }));
        headers = ['Name', 'Specialization', 'Department', 'Email', 'License Number', 'Years of Experience'];
        filename = 'doctors_report';
        break;
      case 'medications':
        data = this.medications.map(m => ({
          'Name': m.name,
          'Form': m.form,
          'Dosage': m.dosage,
          'Price': m.price,
          'Stock Quantity': m.stockQuantity,
          'Total Value': (m.price * m.stockQuantity).toFixed(2),
          'Status': m.isActive ? 'Active' : 'Inactive',
          'Prescription Count': m.prescriptionCount || 0
        }));
        headers = ['Name', 'Form', 'Dosage', 'Price', 'Stock Quantity', 'Total Value', 'Status', 'Prescription Count'];
        filename = 'medications_report';
        break;
      default:
        // Overview report
        data = [{
          'Total Appointments': this.totalAppointments,
          'Total Patients': this.totalPatients,
          'Total Doctors': this.totalDoctors,
          'Completion Rate': `${this.completionRate.toFixed(1)}%`,
          'Cancellation Rate': `${this.cancellationRate.toFixed(1)}%`,
          'Avg Appointments/Day': this.averageAppointmentsPerDay.toFixed(1)
        }];
        headers = ['Total Appointments', 'Total Patients', 'Total Doctors', 'Completion Rate', 'Cancellation Rate', 'Avg Appointments/Day'];
        filename = `overview_${startDate}_to_${endDate}`;
    }
    
    this.exportService.exportToCSV(data, filename, headers);
    this.toastService.success('Report exported successfully');
  }
}
