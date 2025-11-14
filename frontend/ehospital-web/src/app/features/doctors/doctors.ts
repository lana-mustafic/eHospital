import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorService } from './services/doctor.service';
import { CreateDoctorRequest, Doctor } from './models/doctor.model';
import { DepartmentService } from '../departments/services/department.service';
import { Department } from '../departments/models/department.model';

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
  departments: Department[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  doctorForm: FormGroup;

  constructor(
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private fb: FormBuilder
  ) {
    this.doctorForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      specialization: ['', [Validators.required]],
      licenseNumber: ['', [Validators.required]],
      yearsOfExperience: [0, [Validators.required, Validators.min(0)]],
      departmentId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadDoctors();
    this.loadDepartments();
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

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
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
      doctor.specialization.toLowerCase().includes(term) ||
      doctor.email.toLowerCase().includes(term) ||
      doctor.departmentName.toLowerCase().includes(term)
    );
  }

  openAddModal() {
    this.doctorForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.doctorForm.reset();
  }

  saveDoctor() {
    if (this.doctorForm.invalid) {
      this.markFormGroupTouched(this.doctorForm);
      return;
    }

    const formData = this.doctorForm.value;
    const payload: CreateDoctorRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      specialization: formData.specialization,
      licenseNumber: formData.licenseNumber,
      yearsOfExperience: Number(formData.yearsOfExperience),
      departmentId: Number(formData.departmentId)
    };

    this.doctorService.create(payload).subscribe({
      next: () => {
        this.loadDoctors();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating doctor:', error);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get firstName() {
    return this.doctorForm.get('firstName');
  }

  get lastName() {
    return this.doctorForm.get('lastName');
  }

  get email() {
    return this.doctorForm.get('email');
  }

  get password() {
    return this.doctorForm.get('password');
  }

  get phoneNumber() {
    return this.doctorForm.get('phoneNumber');
  }

  get specialization() {
    return this.doctorForm.get('specialization');
  }

  get licenseNumber() {
    return this.doctorForm.get('licenseNumber');
  }

  get departmentId() {
    return this.doctorForm.get('departmentId');
  }
}

