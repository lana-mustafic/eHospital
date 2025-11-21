import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardComponent, WizardStep } from '../../shared/components/wizard/wizard.component';
import { PatientService } from '../patients/services/patient.service';

@Component({
  selector: 'app-patient-registration-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WizardComponent],
  templateUrl: './patient-registration-wizard.component.html',
  styleUrls: ['./patient-registration-wizard.component.scss']
})
export class PatientRegistrationWizardComponent implements OnInit {
  // Form groups for each step
  personalInfoForm!: FormGroup;
  contactInfoForm!: FormGroup;
  medicalInfoForm!: FormGroup;
  emergencyContactForm!: FormGroup;
  insuranceInfoForm!: FormGroup;

  // Wizard configuration
  wizardSteps: WizardStep[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Basic personal details and identification',
      isValid: false
    },
    {
      id: 'contact-info',
      title: 'Contact Information',
      description: 'Address and communication details',
      isValid: false
    },
    {
      id: 'medical-info',
      title: 'Medical Information',
      description: 'Medical history and current conditions',
      isValid: false
    },
    {
      id: 'emergency-contact',
      title: 'Emergency Contact',
      description: 'Emergency contact person details',
      isValid: false
    },
    {
      id: 'insurance-info',
      title: 'Insurance Information',
      description: 'Insurance provider and policy details',
      isValid: false,
      isOptional: true
    }
  ];

  currentStepIndex = 0;
  isSubmitting = false;

  // Dropdown options
  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'unknown', label: 'Unknown' }
  ];

  relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.setupFormValidation();
  }

  private initializeForms() {
    // Personal Information Form
    this.personalInfoForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      ssn: ['', [Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]],
      maritalStatus: [''],
      occupation: [''],
      preferredLanguage: ['English']
    });

    // Contact Information Form
    this.contactInfoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      alternatePhone: [''],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        country: ['United States', Validators.required]
      })
    });

    // Medical Information Form
    this.medicalInfoForm = this.fb.group({
      bloodType: [''],
      allergies: [''],
      currentMedications: [''],
      medicalHistory: [''],
      chronicConditions: [''],
      surgicalHistory: [''],
      familyMedicalHistory: [''],
      smokingStatus: ['never'],
      alcoholConsumption: ['never'],
      exerciseFrequency: ['']
    });

    // Emergency Contact Form
    this.emergencyContactForm = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      alternatePhone: [''],
      email: ['', Validators.email],
      address: ['']
    });

    // Insurance Information Form
    this.insuranceInfoForm = this.fb.group({
      hasInsurance: [false],
      primaryInsurance: this.fb.group({
        provider: [''],
        policyNumber: [''],
        groupNumber: [''],
        subscriberName: [''],
        subscriberDOB: [''],
        relationshipToSubscriber: ['self']
      }),
      secondaryInsurance: this.fb.group({
        provider: [''],
        policyNumber: [''],
        groupNumber: [''],
        subscriberName: [''],
        subscriberDOB: [''],
        relationshipToSubscriber: ['self']
      })
    });
  }

  private setupFormValidation() {
    // Subscribe to form changes to update step validity
    this.personalInfoForm.statusChanges.subscribe(() => {
      this.updateStepValidity(0, this.personalInfoForm.valid);
    });

    this.contactInfoForm.statusChanges.subscribe(() => {
      this.updateStepValidity(1, this.contactInfoForm.valid);
    });

    this.medicalInfoForm.statusChanges.subscribe(() => {
      this.updateStepValidity(2, this.medicalInfoForm.valid);
    });

    this.emergencyContactForm.statusChanges.subscribe(() => {
      this.updateStepValidity(3, this.emergencyContactForm.valid);
    });

    this.insuranceInfoForm.statusChanges.subscribe(() => {
      // Insurance is optional, so always valid
      this.updateStepValidity(4, true);
    });

    // Initial validation
    setTimeout(() => {
      this.updateStepValidity(0, this.personalInfoForm.valid);
      this.updateStepValidity(1, this.contactInfoForm.valid);
      this.updateStepValidity(2, this.medicalInfoForm.valid);
      this.updateStepValidity(3, this.emergencyContactForm.valid);
      this.updateStepValidity(4, true);
    });
  }

  private updateStepValidity(stepIndex: number, isValid: boolean) {
    if (this.wizardSteps[stepIndex]) {
      this.wizardSteps[stepIndex].isValid = isValid;
    }
  }

  onStepChanged(event: { previousStep: number; currentStep: number }) {
    this.currentStepIndex = event.currentStep;
  }

  onWizardCompleted() {
    this.submitRegistration();
  }

  onWizardCancelled() {
    if (confirm('Are you sure you want to cancel patient registration? All entered data will be lost.')) {
      this.router.navigate(['/patients']);
    }
  }

  private async submitRegistration() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      const patientData = {
        ...this.personalInfoForm.value,
        ...this.contactInfoForm.value,
        medicalInfo: this.medicalInfoForm.value,
        emergencyContact: this.emergencyContactForm.value,
        insurance: this.insuranceInfoForm.value.hasInsurance ? this.insuranceInfoForm.value : null,
        registrationDate: new Date().toISOString(),
        status: 'active'
      };

      // Submit to service
      await this.patientService.create(patientData).toPromise();

      // Show success message and redirect
      alert('Patient registration completed successfully!');
      this.router.navigate(['/patients']);

    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Error registering patient. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Helper methods for form validation display
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return `Please enter a valid ${fieldName}`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  // Phone number formatting
  formatPhoneNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    event.target.value = value;
  }

  // SSN formatting
  formatSSN(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 5) {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 9)}`;
    } else if (value.length >= 3) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }
    event.target.value = value;
  }

  getCurrentForm(): FormGroup {
    switch (this.currentStepIndex) {
      case 0: return this.personalInfoForm;
      case 1: return this.contactInfoForm;
      case 2: return this.medicalInfoForm;
      case 3: return this.emergencyContactForm;
      case 4: return this.insuranceInfoForm;
      default: return this.personalInfoForm;
    }
  }
}
