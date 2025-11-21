import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardComponent, WizardStep } from '../../shared/components/wizard/wizard.component';
import { AppointmentService } from '../appointments/services/appointment.service';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { DepartmentService } from '../departments/services/department.service';

interface TimeSlot {
  time: string;
  available: boolean;
  doctorId?: number;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  departmentId: number;
  availableSlots: TimeSlot[];
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-appointment-booking-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WizardComponent],
  templateUrl: './appointment-booking-wizard.component.html',
  styleUrls: ['./appointment-booking-wizard.component.scss']
})
export class AppointmentBookingWizardComponent implements OnInit {
  // Form groups for each step
  patientSelectionForm!: FormGroup;
  appointmentDetailsForm!: FormGroup;
  doctorSelectionForm!: FormGroup;
  timeSlotForm!: FormGroup;
  confirmationForm!: FormGroup;

  // Data
  patients: Patient[] = [];
  departments: Department[] = [];
  doctors: Doctor[] = [];
  availableDoctors: Doctor[] = [];
  availableTimeSlots: TimeSlot[] = [];
  selectedPatient: Patient | null = null;
  selectedDoctor: Doctor | null = null;
  selectedDate: string = '';
  selectedTimeSlot: TimeSlot | null = null;

  // Wizard configuration
  wizardSteps: WizardStep[] = [
    {
      id: 'patient-selection',
      title: 'Select Patient',
      description: 'Choose the patient for this appointment',
      isValid: false
    },
    {
      id: 'appointment-details',
      title: 'Appointment Details',
      description: 'Specify appointment type and department',
      isValid: false
    },
    {
      id: 'doctor-selection',
      title: 'Choose Doctor',
      description: 'Select preferred doctor or any available',
      isValid: false
    },
    {
      id: 'time-slot',
      title: 'Select Time',
      description: 'Choose date and time for the appointment',
      isValid: false
    },
    {
      id: 'confirmation',
      title: 'Confirm Booking',
      description: 'Review and confirm appointment details',
      isValid: false
    }
  ];

  currentStepIndex = 0;
  isSubmitting = false;
  isLoadingData = false;

  // Appointment types
  appointmentTypes = [
    { value: 'consultation', label: 'Consultation', duration: 30 },
    { value: 'follow-up', label: 'Follow-up', duration: 15 },
    { value: 'procedure', label: 'Procedure', duration: 60 },
    { value: 'emergency', label: 'Emergency', duration: 45 },
    { value: 'routine-checkup', label: 'Routine Checkup', duration: 30 },
    { value: 'diagnostic', label: 'Diagnostic', duration: 45 }
  ];

  // Priority levels
  priorityLevels = [
    { value: 'routine', label: 'Routine', color: '#10b981' },
    { value: 'urgent', label: 'Urgent', color: '#f59e0b' },
    { value: 'emergency', label: 'Emergency', color: '#ef4444' }
  ];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.loadInitialData();
    this.setupFormValidation();
  }

  private initializeForms() {
    // Patient Selection Form
    this.patientSelectionForm = this.fb.group({
      patientId: ['', Validators.required],
      searchTerm: [''],
      createNewPatient: [false]
    });

    // Appointment Details Form
    this.appointmentDetailsForm = this.fb.group({
      appointmentType: ['', Validators.required],
      departmentId: ['', Validators.required],
      priority: ['routine', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      notes: [''],
      duration: [30],
      isFollowUp: [false],
      previousAppointmentId: ['']
    });

    // Doctor Selection Form
    this.doctorSelectionForm = this.fb.group({
      doctorId: ['', Validators.required],
      preferredDoctor: [''],
      anyAvailableDoctor: [false]
    });

    // Time Slot Form
    this.timeSlotForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      timeSlot: ['', Validators.required],
      alternativeDate1: [''],
      alternativeDate2: [''],
      flexibleTiming: [false]
    });

    // Confirmation Form
    this.confirmationForm = this.fb.group({
      confirmDetails: [false, Validators.requiredTrue],
      sendReminder: [true],
      reminderMethod: ['email'],
      specialInstructions: [''],
      consentToTreatment: [false, Validators.requiredTrue]
    });
  }

  private async loadInitialData() {
    this.isLoadingData = true;
    try {
      // Load patients, departments, and doctors
      const [patients, departments, doctors] = await Promise.all([
        this.patientService.getAll().toPromise(),
        this.departmentService.getAll().toPromise(),
        this.doctorService.getAll().toPromise()
      ]);

      this.patients = patients || [];
      this.departments = departments || [];
      this.doctors = doctors || [];
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.isLoadingData = false;
    }
  }

  private setupFormValidation() {
    // Subscribe to form changes to update step validity
    this.patientSelectionForm.statusChanges.subscribe(() => {
      this.updateStepValidity(0, this.patientSelectionForm.valid);
    });

    this.appointmentDetailsForm.statusChanges.subscribe(() => {
      this.updateStepValidity(1, this.appointmentDetailsForm.valid);
    });

    this.doctorSelectionForm.statusChanges.subscribe(() => {
      this.updateStepValidity(2, this.doctorSelectionForm.valid);
    });

    this.timeSlotForm.statusChanges.subscribe(() => {
      this.updateStepValidity(3, this.timeSlotForm.valid);
    });

    this.confirmationForm.statusChanges.subscribe(() => {
      this.updateStepValidity(4, this.confirmationForm.valid);
    });

    // Watch for department changes to filter doctors
    this.appointmentDetailsForm.get('departmentId')?.valueChanges.subscribe(departmentId => {
      this.filterDoctorsByDepartment(departmentId);
    });

    // Watch for appointment type changes to set duration
    this.appointmentDetailsForm.get('appointmentType')?.valueChanges.subscribe(type => {
      const appointmentType = this.appointmentTypes.find(t => t.value === type);
      if (appointmentType) {
        this.appointmentDetailsForm.patchValue({ duration: appointmentType.duration });
      }
    });

    // Watch for date changes to load available time slots
    this.timeSlotForm.get('appointmentDate')?.valueChanges.subscribe(date => {
      if (date && this.selectedDoctor) {
        this.loadAvailableTimeSlots(date, this.selectedDoctor.id);
      }
    });

    // Watch for patient selection
    this.patientSelectionForm.get('patientId')?.valueChanges.subscribe(patientId => {
      this.selectedPatient = this.patients.find(p => p.id === parseInt(patientId)) || null;
    });

    // Watch for doctor selection
    this.doctorSelectionForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      this.selectedDoctor = this.availableDoctors.find(d => d.id === parseInt(doctorId)) || null;
      if (this.selectedDoctor && this.timeSlotForm.get('appointmentDate')?.value) {
        this.loadAvailableTimeSlots(this.timeSlotForm.get('appointmentDate')?.value, this.selectedDoctor.id);
      }
    });
  }

  private updateStepValidity(stepIndex: number, isValid: boolean) {
    if (this.wizardSteps[stepIndex]) {
      this.wizardSteps[stepIndex].isValid = isValid;
    }
  }

  private filterDoctorsByDepartment(departmentId: string) {
    if (departmentId) {
      this.availableDoctors = this.doctors.filter(d => d.departmentId === parseInt(departmentId));
    } else {
      this.availableDoctors = [...this.doctors];
    }
    
    // Reset doctor selection when department changes
    this.doctorSelectionForm.patchValue({ doctorId: '' });
    this.selectedDoctor = null;
  }

  private async loadAvailableTimeSlots(date: string, doctorId: number) {
    try {
      // Simulate loading available time slots
      // In a real app, this would call an API
      const timeSlots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const available = Math.random() > 0.3; // 70% chance of being available
          
          timeSlots.push({
            time,
            available,
            doctorId
          });
        }
      }
      
      this.availableTimeSlots = timeSlots;
    } catch (error) {
      console.error('Error loading time slots:', error);
      this.availableTimeSlots = [];
    }
  }

  onStepChanged(event: { previousStep: number; currentStep: number }) {
    this.currentStepIndex = event.currentStep;
  }

  onWizardCompleted() {
    this.submitAppointment();
  }

  onWizardCancelled() {
    if (confirm('Are you sure you want to cancel appointment booking? All entered data will be lost.')) {
      this.router.navigate(['/appointments']);
    }
  }

  private async submitAppointment() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      const appointmentData = {
        patientId: this.selectedPatient?.id,
        doctorId: this.selectedDoctor?.id,
        departmentId: this.appointmentDetailsForm.get('departmentId')?.value,
        appointmentDate: this.timeSlotForm.get('appointmentDate')?.value,
        startTime: this.timeSlotForm.get('timeSlot')?.value,
        appointmentType: this.appointmentDetailsForm.get('appointmentType')?.value,
        priority: this.appointmentDetailsForm.get('priority')?.value,
        reason: this.appointmentDetailsForm.get('reason')?.value,
        notes: this.appointmentDetailsForm.get('notes')?.value,
        duration: this.appointmentDetailsForm.get('duration')?.value,
        status: 'Scheduled',
        reminderSettings: {
          sendReminder: this.confirmationForm.get('sendReminder')?.value,
          reminderMethod: this.confirmationForm.get('reminderMethod')?.value
        },
        specialInstructions: this.confirmationForm.get('specialInstructions')?.value,
        createdAt: new Date().toISOString()
      };

      // Submit to service
      await this.appointmentService.create(appointmentData).toPromise();

      // Show success message and redirect
      alert('Appointment booked successfully!');
      this.router.navigate(['/appointments']);

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Helper methods
  searchPatients(searchTerm: string): Patient[] {
    if (!searchTerm) return this.patients;
    
    return this.patients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber.includes(searchTerm)
    );
  }

  getPatientDisplayName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  }

  getAppointmentTypeName(type: string): string {
    const appointmentType = this.appointmentTypes.find(t => t.value === type);
    return appointmentType ? appointmentType.label : type;
  }

  getPriorityName(priority: string): string {
    const priorityLevel = this.priorityLevels.find(p => p.value === priority);
    return priorityLevel ? priorityLevel.label : priority;
  }

  getPriorityColor(priority: string): string {
    const priorityLevel = this.priorityLevels.find(p => p.value === priority);
    return priorityLevel ? priorityLevel.color : '#6b7280';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['requiredTrue']) return 'This field must be checked';
    }
    return '';
  }

  getCurrentForm(): FormGroup {
    switch (this.currentStepIndex) {
      case 0: return this.patientSelectionForm;
      case 1: return this.appointmentDetailsForm;
      case 2: return this.doctorSelectionForm;
      case 3: return this.timeSlotForm;
      case 4: return this.confirmationForm;
      default: return this.patientSelectionForm;
    }
  }
}
