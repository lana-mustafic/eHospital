import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardComponent, WizardStep } from '../../shared/components/wizard/wizard.component';

@Component({
  selector: 'app-patient-registration-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WizardComponent],
  templateUrl: './patient-registration-wizard.component.html',
  styleUrls: ['./patient-registration-wizard.component.scss']
})
export class PatientRegistrationWizardComponent implements OnInit {
  wizardSteps: WizardStep[] = [];
  
  // Forms for each step
  personalInfoForm!: FormGroup;
  contactInfoForm!: FormGroup;
  medicalInfoForm!: FormGroup;
  emergencyContactForm!: FormGroup;
  insuranceInfoForm!: FormGroup;

  currentStep = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupWizardSteps();
  }

  initializeForms(): void {
    // Personal Information Form
    this.personalInfoForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]],
      maritalStatus: [''],
      occupation: [''],
      preferredLanguage: ['English']
    });

    // Contact Information Form
    this.contactInfoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      address: this.fb.group({
        street: ['', Validators.required],
        apartment: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
      })
    });

    // Medical Information Form
    this.medicalInfoForm = this.fb.group({
      bloodType: [''],
      allergies: [''],
      currentMedications: [''],
      chronicConditions: [''],
      surgicalHistory: [''],
      smokingStatus: ['No'],
      alcoholConsumption: ['No'],
      exerciseFrequency: ['Rarely']
    });

    // Emergency Contact Form
    this.emergencyContactForm = this.fb.group({
      fullName: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      email: ['', Validators.email],
      address: ['']
    });

    // Insurance Information Form
    this.insuranceInfoForm = this.fb.group({
      hasInsurance: [false],
      providerName: [''],
      policyNumber: [''],
      groupNumber: [''],
      subscriberName: [''],
      subscriberRelationship: ['Self']
    });

    // Subscribe to form changes to update step validity
    this.personalInfoForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.contactInfoForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.medicalInfoForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.emergencyContactForm.statusChanges.subscribe(() => this.updateStepValidity());
    this.insuranceInfoForm.statusChanges.subscribe(() => this.updateStepValidity());
  }

  setupWizardSteps(): void {
    this.wizardSteps = [
      {
        id: 'personal-info',
        title: 'Personal Information',
        description: 'Basic personal details',
        isValid: this.personalInfoForm.valid,
        isCompleted: false
      },
      {
        id: 'contact-info',
        title: 'Contact Information',
        description: 'Contact details and address',
        isValid: this.contactInfoForm.valid,
        isCompleted: false
      },
      {
        id: 'medical-info',
        title: 'Medical Information',
        description: 'Medical history and conditions',
        isValid: true, // Medical info is optional
        isCompleted: false
      },
      {
        id: 'emergency-contact',
        title: 'Emergency Contact',
        description: 'Emergency contact person',
        isValid: this.emergencyContactForm.valid,
        isCompleted: false
      },
      {
        id: 'insurance-info',
        title: 'Insurance Information',
        description: 'Insurance details (optional)',
        isValid: true, // Insurance is optional
        isCompleted: false
      }
    ];
  }

  updateStepValidity(): void {
    if (this.wizardSteps.length > 0) {
      this.wizardSteps[0].isValid = this.personalInfoForm.valid;
      this.wizardSteps[1].isValid = this.contactInfoForm.valid;
      this.wizardSteps[2].isValid = true; // Medical info is optional
      this.wizardSteps[3].isValid = this.emergencyContactForm.valid;
      this.wizardSteps[4].isValid = true; // Insurance is optional
    }
  }

  onStepChanged(event: { currentStep: number; step: WizardStep }): void {
    this.currentStep = event.currentStep;
  }

  onWizardCompleted(data: any): void {
    // Collect all form data
    const registrationData = {
      personalInfo: this.personalInfoForm.value,
      contactInfo: this.contactInfoForm.value,
      medicalInfo: this.medicalInfoForm.value,
      emergencyContact: this.emergencyContactForm.value,
      insuranceInfo: this.insuranceInfoForm.value,
      registrationDate: new Date().toISOString()
    };

    console.log('Patient Registration Data:', registrationData);
    
    // Here you would typically send the data to a service
    // this.patientService.registerPatient(registrationData).subscribe(...)
    
    alert('Patient registration completed successfully!');
    this.router.navigate(['/patients']);
  }

  onWizardCancelled(): void {
    if (confirm('Are you sure you want to cancel the registration? All entered data will be lost.')) {
      this.router.navigate(['/patients']);
    }
  }

  // Helper methods for form validation
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isAddressFieldInvalid(fieldName: string): boolean {
    const addressGroup = this.contactInfoForm.get('address') as FormGroup;
    if (!addressGroup) return false;
    const field = addressGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return `Please enter a valid ${fieldName}`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  // Format helpers
  formatSSN(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 9) {
      value = value.substring(0, 9);
    }
    if (value.length > 5) {
      value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
    } else if (value.length > 3) {
      value = value.substring(0, 3) + '-' + value.substring(3);
    }
    this.personalInfoForm.patchValue({ ssn: value });
  }

  formatPhoneNumber(event: any, formGroup: FormGroup, fieldName: string): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 10) {
      value = value.substring(0, 10);
    }
    if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length > 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    formGroup.patchValue({ [fieldName]: value });
  }

  // Data options
  getGenderOptions(): string[] {
    return ['Male', 'Female', 'Other', 'Prefer not to say'];
  }

  getMaritalStatusOptions(): string[] {
    return ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
  }

  getBloodTypeOptions(): string[] {
    return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  }

  getSmokingStatusOptions(): string[] {
    return ['No', 'Yes - Current', 'Yes - Former', 'Occasionally'];
  }

  getAlcoholOptions(): string[] {
    return ['No', 'Occasionally', 'Regularly', 'Prefer not to say'];
  }

  getExerciseOptions(): string[] {
    return ['Rarely', 'Weekly', 'Daily', '2-3 times per week', '4-5 times per week'];
  }

  getRelationshipOptions(): string[] {
    return ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
  }

  getSubscriberRelationshipOptions(): string[] {
    return ['Self', 'Spouse', 'Child', 'Other'];
  }

  getStateOptions(): string[] {
    return [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
  }
}
