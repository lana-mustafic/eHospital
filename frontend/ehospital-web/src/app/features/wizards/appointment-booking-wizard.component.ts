import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardComponent, WizardStep } from '../../shared/components/wizard/wizard.component';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-appointment-booking-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WizardComponent],
  templateUrl: './appointment-booking-wizard.component.html',
  styleUrls: ['./appointment-booking-wizard.component.scss']
})
export class AppointmentBookingWizardComponent implements OnInit {
  wizardSteps: WizardStep[] = [];
  
  // Forms for each step
  patientSelectionForm!: FormGroup;
  appointmentDetailsForm!: FormGroup;
  doctorSelectionForm!: FormGroup;
  timeSlotSelectionForm!: FormGroup;
  confirmationForm!: FormGroup;

  currentStep = 0;

  // Mock data
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  availableTimeSlots: TimeSlot[] = [];
  selectedPatient: Patient | null = null;
  selectedDoctor: Doctor | null = null;

  constructor(
    private fb: FormBuilder,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadMockData();
    this.initializeForms();
    this.setupWizardSteps();
  }

  loadMockData(): void {
    // Mock patients
    this.patients = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phone: '(555) 123-4567' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', phone: '(555) 234-5678' },
      { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@email.com', phone: '(555) 345-6789' },
      { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice.brown@email.com', phone: '(555) 456-7890' },
      { id: 5, firstName: 'Charlie', lastName: 'Wilson', email: 'charlie.wilson@email.com', phone: '(555) 567-8901' }
    ];

    // Mock doctors
    this.doctors = [
      { id: 1, firstName: 'Dr. Sarah', lastName: 'Johnson', specialization: 'Cardiology', department: 'Cardiology' },
      { id: 2, firstName: 'Dr. Michael', lastName: 'Chen', specialization: 'Neurology', department: 'Neurology' },
      { id: 3, firstName: 'Dr. Emily', lastName: 'Davis', specialization: 'Pediatrics', department: 'Pediatrics' },
      { id: 4, firstName: 'Dr. Robert', lastName: 'Miller', specialization: 'Orthopedics', department: 'Orthopedics' },
      { id: 5, firstName: 'Dr. Lisa', lastName: 'Anderson', specialization: 'Internal Medicine', department: 'Internal Medicine' }
    ];

    // Mock time slots
    this.generateTimeSlots();
  }

  generateTimeSlots(): void {
    const slots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    this.availableTimeSlots = slots.map(time => ({
      time,
      available: Math.random() > 0.3 // 70% chance of being available
    }));
  }

  initializeForms(): void {
    // Patient Selection Form
    this.patientSelectionForm = this.fb.group({
      patientId: ['', Validators.required],
      isNewPatient: [false]
    });

    // Appointment Details Form
    this.appointmentDetailsForm = this.fb.group({
      appointmentType: ['', Validators.required],
      department: ['', Validators.required],
      priority: ['Routine', Validators.required],
      reason: ['', Validators.required],
      notes: [''],
      duration: [30, [Validators.required, Validators.min(15)]]
    });

    // Doctor Selection Form
    this.doctorSelectionForm = this.fb.group({
      doctorId: ['', Validators.required]
    });

    // Time Slot Selection Form
    this.timeSlotSelectionForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      startTime: ['', Validators.required]
    });

    // Confirmation Form
    this.confirmationForm = this.fb.group({
      confirmBooking: [false, Validators.requiredTrue],
      sendReminder: [true],
      reminderMethod: ['email']
    });

    // Subscribe to form changes
    this.patientSelectionForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.appointmentDetailsForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.doctorSelectionForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.timeSlotSelectionForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.confirmationForm.statusChanges.subscribe(() => this.updateStepValidity());

    // Watch for patient selection changes
    this.patientSelectionForm.get('patientId')?.valueChanges.subscribe(patientId => {
      this.selectedPatient = this.patients.find(p => p.id === +patientId) || null;
    });

    // Watch for doctor selection changes
    this.doctorSelectionForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      this.selectedDoctor = this.doctors.find(d => d.id === +doctorId) || null;
      if (this.selectedDoctor) {
        this.generateTimeSlots(); // Regenerate slots when doctor changes
      }
    });

    // Watch for department changes to filter doctors
    this.appointmentDetailsForm.get('department')?.valueChanges.subscribe(department => {
      this.doctorSelectionForm.patchValue({ doctorId: '' });
      this.selectedDoctor = null;
    });
  }

  setupWizardSteps(): void {
    this.wizardSteps = [
      {
        id: 'patient-selection',
        title: 'Select Patient',
        description: 'Choose the patient for this appointment',
        isValid: this.patientSelectionForm.valid,
        isCompleted: false
      },
      {
        id: 'appointment-details',
        title: 'Appointment Details',
        description: 'Specify appointment type and details',
        isValid: this.appointmentDetailsForm.valid,
        isCompleted: false
      },
      {
        id: 'doctor-selection',
        title: 'Select Doctor',
        description: 'Choose the healthcare provider',
        isValid: this.doctorSelectionForm.valid,
        isCompleted: false
      },
      {
        id: 'time-slot',
        title: 'Select Time',
        description: 'Choose date and time slot',
        isValid: this.timeSlotSelectionForm.valid,
        isCompleted: false
      },
      {
        id: 'confirmation',
        title: 'Confirmation',
        description: 'Review and confirm appointment',
        isValid: this.confirmationForm.valid,
        isCompleted: false
      }
    ];
  }

  updateStepValidity(): void {
    if (this.wizardSteps.length > 0) {
      this.wizardSteps[0].isValid = this.patientSelectionForm.valid;
      this.wizardSteps[1].isValid = this.appointmentDetailsForm.valid;
      this.wizardSteps[2].isValid = this.doctorSelectionForm.valid;
      this.wizardSteps[3].isValid = this.timeSlotSelectionForm.valid;
      this.wizardSteps[4].isValid = this.confirmationForm.valid;
    }
  }

  onStepChanged(event: { currentStep: number; step: WizardStep }): void {
    this.currentStep = event.currentStep;
  }

  onWizardCompleted(data: any): void {
    // Collect all form data
    const appointmentData = {
      patientId: this.selectedPatient?.id,
      doctorId: this.selectedDoctor?.id,
      appointmentType: this.appointmentDetailsForm.get('appointmentType')?.value,
      department: this.appointmentDetailsForm.get('department')?.value,
      priority: this.appointmentDetailsForm.get('priority')?.value,
      reason: this.appointmentDetailsForm.get('reason')?.value,
      notes: this.appointmentDetailsForm.get('notes')?.value,
      duration: this.appointmentDetailsForm.get('duration')?.value,
      appointmentDate: this.timeSlotSelectionForm.get('appointmentDate')?.value,
      startTime: this.timeSlotSelectionForm.get('startTime')?.value,
      endTime: this.calculateEndTime(),
      status: 'scheduled',
      reminderSettings: {
        enabled: this.confirmationForm.get('sendReminder')?.value,
        method: this.confirmationForm.get('reminderMethod')?.value
      },
      createdAt: new Date().toISOString()
    };

    console.log('Appointment Booking Data:', appointmentData);
    
    // Here you would typically send the data to a service
    // this.appointmentService.create(appointmentData).subscribe(...)
    
    alert('Appointment booked successfully!');
    this.router.navigate(['/appointments']);
  }

  onWizardCancelled(): void {
    if (confirm('Are you sure you want to cancel the appointment booking? All entered data will be lost.')) {
      this.router.navigate(['/appointments']);
    }
  }

  // Helper methods
  calculateEndTime(): string {
    const startTime = this.timeSlotSelectionForm.get('startTime')?.value;
    const duration = this.appointmentDetailsForm.get('duration')?.value || 30;
    
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    return endDate.toTimeString().slice(0, 5);
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }

  getFilteredDoctors(): Doctor[] {
    const selectedDepartment = this.appointmentDetailsForm.get('department')?.value;
    if (!selectedDepartment) return this.doctors;
    
    return this.doctors.filter(doctor => doctor.department === selectedDepartment);
  }

  getAvailableTimeSlots(): TimeSlot[] {
    return this.availableTimeSlots.filter(slot => slot.available);
  }

  // Data options
  getAppointmentTypes(): string[] {
    return ['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Checkup', 'Therapy'];
  }

  getDepartments(): string[] {
    return ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Internal Medicine', 'Dermatology'];
  }

  getPriorityOptions(): string[] {
    return ['Routine', 'Urgent', 'Emergency'];
  }

  getReminderMethods(): string[] {
    return ['email', 'sms', 'phone'];
  }

  // Format helpers
  formatPatientName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  formatDoctorName(doctor: Doctor): string {
    return `${doctor.firstName} ${doctor.lastName}`;
  }

  formatDateTime(date: string, time: string): string {
    if (!date || !time) return '';
    
    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `${formattedDate} at ${time}`;
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
