export interface Department {
  id?: string;
  name: string;
  description?: string;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  name: string;
  description: string;
  headOfDepartment: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}

