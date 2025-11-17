import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from './services/patient.service';
import { CreatePatientRequest, Patient, UpdatePatientRequest } from './models/patient.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  isEditMode = false;
  selectedPatient: Patient | null = null;
  patientForm: FormGroup;

  constructor(
    private patientService: PatientService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: [''],
      emergencyContact: [''],
      bloodType: ['']
    });
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load patients');
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredPatients = this.patients;
      return;
    }

    this.filteredPatients = this.patients.filter(patient =>
      patient.firstName.toLowerCase().includes(term) ||
      patient.lastName.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.phoneNumber.includes(term)
    );
  }

  getAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedPatient = null;
    this.patientForm.reset();
    this.setPasswordValidators(true);
    this.showModal = true;
  }

  openEditModal(patient: Patient) {
    this.isEditMode = true;
    this.selectedPatient = patient;
    this.patientForm.patchValue({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      bloodType: patient.bloodType
    });
    this.patientForm.get('password')?.reset();
    this.setPasswordValidators(false);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.patientForm.reset();
    this.selectedPatient = null;
  }

  savePatient() {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched(this.patientForm);
      return;
    }

    const formData = this.patientForm.value;

    if (this.isEditMode && this.selectedPatient?.id) {
      const payload: UpdatePatientRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodType: formData.bloodType
      };

      this.patientService.update(this.selectedPatient.id, payload).subscribe({
        next: () => {
          this.toastService.success('Patient updated successfully');
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.toastService.error(error.error?.message || 'Failed to update patient');
        }
      });
    } else {
      const payload: CreatePatientRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodType: formData.bloodType
      };

      this.patientService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Patient created successfully');
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.toastService.error(error.error?.message || 'Failed to create patient');
        }
      });
    }
  }

  deletePatient(patient: Patient) {
    if (!patient.id) return;
    
    if (confirm(`Are you sure you want to delete patient "${patient.firstName} ${patient.lastName}"?`)) {
      this.patientService.delete(patient.id).subscribe({
        next: () => {
          this.toastService.success('Patient deleted successfully');
          this.loadPatients();
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.toastService.error(error.error?.message || 'Failed to delete patient');
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private setPasswordValidators(isRequired: boolean) {
    const passwordControl = this.patientForm.get('password');
    if (!passwordControl) {
      return;
    }

    if (isRequired) {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      passwordControl.clearValidators();
    }

    passwordControl.updateValueAndValidity();
  }

  get firstName() {
    return this.patientForm.get('firstName');
  }

  get lastName() {
    return this.patientForm.get('lastName');
  }

  get dateOfBirth() {
    return this.patientForm.get('dateOfBirth');
  }

  get gender() {
    return this.patientForm.get('gender');
  }

  get phoneNumber() {
    return this.patientForm.get('phoneNumber');
  }

  get email() {
    return this.patientForm.get('email');
  }

  get password() {
    return this.patientForm.get('password');
  }
}
