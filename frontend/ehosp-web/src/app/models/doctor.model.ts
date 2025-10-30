export interface Doctor {
  id: number;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
}

export interface CreateDoctor {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  departmentId: number;
}