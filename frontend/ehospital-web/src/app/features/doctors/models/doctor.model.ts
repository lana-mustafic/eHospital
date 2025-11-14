export interface Doctor {
  id?: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  specialty: string;
  department?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  yearsOfExperience?: number;
  qualifications?: string;
  bio?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  schedule?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorFormData {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  specialty: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearsOfExperience: number;
  qualifications: string;
  bio: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  schedule: string;
}

