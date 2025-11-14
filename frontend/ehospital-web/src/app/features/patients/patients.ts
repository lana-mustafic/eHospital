import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from './services/patient.service';
import { Patient } from './models/patient.model';

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
    private fb: FormBuilder
  ) {
    this.patientForm = this.fb.group({
      medicalRecordNumber: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required]],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      bloodType: [''],
      allergies: [''],
      medicalHistory: ['']
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
      patient.medicalRecordNumber.toLowerCase().includes(term) ||
      patient.email?.toLowerCase().includes(term) ||
      patient.phone.includes(term)
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
    this.showModal = true;
  }

  openEditModal(patient: Patient) {
    this.isEditMode = true;
    this.selectedPatient = patient;
    this.patientForm.patchValue({
      medicalRecordNumber: patient.medicalRecordNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      email: patient.email || '',
      phone: patient.phone,
      address: patient.address || '',
      city: patient.city || '',
      state: patient.state || '',
      zipCode: patient.zipCode || '',
      emergencyContactName: patient.emergencyContactName || '',
      emergencyContactPhone: patient.emergencyContactPhone || '',
      bloodType: patient.bloodType || '',
      allergies: patient.allergies || '',
      medicalHistory: patient.medicalHistory || ''
    });
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
    const patient: Patient = {
      ...formData,
      id: this.selectedPatient?.id
    };

    if (this.isEditMode && this.selectedPatient?.id) {
      this.patientService.update(this.selectedPatient.id, patient).subscribe({
        next: () => {
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating patient:', error);
        }
      });
    } else {
      this.patientService.create(patient).subscribe({
        next: () => {
          this.loadPatients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating patient:', error);
        }
      });
    }
  }

  deletePatient(patient: Patient) {
    if (!patient.id) return;
    
    if (confirm(`Are you sure you want to delete patient "${patient.firstName} ${patient.lastName}"?`)) {
      this.patientService.delete(patient.id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
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

  get medicalRecordNumber() {
    return this.patientForm.get('medicalRecordNumber');
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

  get phone() {
    return this.patientForm.get('phone');
  }

  get email() {
    return this.patientForm.get('email');
  }
}
