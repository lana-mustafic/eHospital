export interface Department {
  id: number;
  name: string;
  description: string;
  phoneNumber: string;
  email: string;
  doctorCount: number;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
}

