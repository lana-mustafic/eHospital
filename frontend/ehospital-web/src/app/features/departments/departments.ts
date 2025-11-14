import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DepartmentService } from './services/department.service';
import { Department } from './models/department.model';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.scss']
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  isEditMode = false;
  selectedDepartment: Department | null = null;
  departmentForm: FormGroup;

  constructor(
    private departmentService: DepartmentService,
    private fb: FormBuilder
  ) {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      headOfDepartment: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      location: ['']
    });
  }

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.isLoading = true;
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        this.filteredDepartments = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.isLoading = false;
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredDepartments = this.departments;
      return;
    }

    this.filteredDepartments = this.departments.filter(dept =>
      dept.name.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term) ||
      dept.headOfDepartment?.toLowerCase().includes(term) ||
      dept.location?.toLowerCase().includes(term)
    );
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedDepartment = null;
    this.departmentForm.reset();
    this.showModal = true;
  }

  openEditModal(department: Department) {
    this.isEditMode = true;
    this.selectedDepartment = department;
    this.departmentForm.patchValue({
      name: department.name,
      description: department.description || '',
      headOfDepartment: department.headOfDepartment || '',
      contactEmail: department.contactEmail || '',
      contactPhone: department.contactPhone || '',
      location: department.location || ''
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.departmentForm.reset();
    this.selectedDepartment = null;
  }

  saveDepartment() {
    if (this.departmentForm.invalid) {
      this.markFormGroupTouched(this.departmentForm);
      return;
    }

    const formData = this.departmentForm.value;
    const department: Department = {
      ...formData,
      id: this.selectedDepartment?.id
    };

    if (this.isEditMode && this.selectedDepartment?.id) {
      this.departmentService.update(this.selectedDepartment.id, department).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating department:', error);
        }
      });
    } else {
      this.departmentService.create(department).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating department:', error);
        }
      });
    }
  }

  deleteDepartment(department: Department) {
    if (!department.id) return;
    
    if (confirm(`Are you sure you want to delete "${department.name}"?`)) {
      this.departmentService.delete(department.id).subscribe({
        next: () => {
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error deleting department:', error);
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

  get name() {
    return this.departmentForm.get('name');
  }

  get contactEmail() {
    return this.departmentForm.get('contactEmail');
  }
}
