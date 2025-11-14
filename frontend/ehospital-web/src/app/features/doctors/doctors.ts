import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorService } from './services/doctor.service';
import { Doctor } from './models/doctor.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './doctors.html',
  styleUrls: ['./doctors.scss']
})
export class DoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  isEditMode = false;
  selectedDoctor: Doctor | null = null;
  doctorForm: FormGroup;

  constructor(
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) {
    this.doctorForm = this.fb.group({
      licenseNumber: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      specialty: ['', [Validators.required]],
      department: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      yearsOfExperience: [0],
      qualifications: [''],
      bio: [''],
      status: ['Active', [Validators.required]],
      schedule: ['']
    });
  }

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
        this.filteredDoctors = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.isLoading = false;
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredDoctors = this.doctors;
      return;
    }

    this.filteredDoctors = this.doctors.filter(doctor =>
      doctor.firstName.toLowerCase().includes(term) ||
      doctor.lastName.toLowerCase().includes(term) ||
      doctor.licenseNumber.toLowerCase().includes(term) ||
      doctor.specialty.toLowerCase().includes(term) ||
      doctor.email.toLowerCase().includes(term) ||
      doctor.department?.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Inactive':
        return 'status-inactive';
      case 'On Leave':
        return 'status-leave';
      default:
        return '';
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedDoctor = null;
    this.doctorForm.reset();
    this.doctorForm.patchValue({ status: 'Active' });
    this.showModal = true;
  }

  openEditModal(doctor: Doctor) {
    this.isEditMode = true;
    this.selectedDoctor = doctor;
    this.doctorForm.patchValue({
      licenseNumber: doctor.licenseNumber,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      department: doctor.department || '',
      email: doctor.email,
      phone: doctor.phone,
      address: doctor.address || '',
      city: doctor.city || '',
      state: doctor.state || '',
      zipCode: doctor.zipCode || '',
      yearsOfExperience: doctor.yearsOfExperience || 0,
      qualifications: doctor.qualifications || '',
      bio: doctor.bio || '',
      status: doctor.status,
      schedule: doctor.schedule || ''
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.doctorForm.reset();
    this.selectedDoctor = null;
  }

  saveDoctor() {
    if (this.doctorForm.invalid) {
      this.markFormGroupTouched(this.doctorForm);
      return;
    }

    const formData = this.doctorForm.value;
    const doctor: Doctor = {
      ...formData,
      id: this.selectedDoctor?.id
    };

    if (this.isEditMode && this.selectedDoctor?.id) {
      this.doctorService.update(this.selectedDoctor.id, doctor).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating doctor:', error);
        }
      });
    } else {
      this.doctorService.create(doctor).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating doctor:', error);
        }
      });
    }
  }

  deleteDoctor(doctor: Doctor) {
    if (!doctor.id) return;
    
    if (confirm(`Are you sure you want to delete Dr. "${doctor.firstName} ${doctor.lastName}"?`)) {
      this.doctorService.delete(doctor.id).subscribe({
        next: () => {
          this.loadDoctors();
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
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

  get licenseNumber() {
    return this.doctorForm.get('licenseNumber');
  }

  get firstName() {
    return this.doctorForm.get('firstName');
  }

  get lastName() {
    return this.doctorForm.get('lastName');
  }

  get specialty() {
    return this.doctorForm.get('specialty');
  }

  get email() {
    return this.doctorForm.get('email');
  }

  get phone() {
    return this.doctorForm.get('phone');
  }

  get status() {
    return this.doctorForm.get('status');
  }
}
