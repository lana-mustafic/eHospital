export interface PatientSearchFilter {
  searchTerm?: string;
  gender?: string;
  bloodType?: string;
  dateOfBirthFrom?: string;
  dateOfBirthTo?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  department?: string;
  status?: string;
  ageFrom?: number;
  ageTo?: number;
  hasEmergencyContact?: boolean;
  hasBloodType?: boolean;
}

export interface SavedSearchFilter {
  id: string;
  name: string;
  filter: PatientSearchFilter;
  createdAt: string;
  isDefault?: boolean;
}

export type QuickFilterType = 'today' | 'thisWeek' | 'thisMonth' | 'all';

