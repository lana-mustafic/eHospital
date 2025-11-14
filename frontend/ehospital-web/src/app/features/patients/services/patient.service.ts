import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.patients}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Patient[]> {
    // Mock data for development - replace with real API call when backend is ready
    return this.getMockPatients();
    
    // Uncomment when backend is ready:
    // return this.http.get<Patient[]>(this.apiUrl);
  }

  getById(id: string): Observable<Patient> {
    // Mock implementation
    const mockData = this.getMockDataArray();
    const patient = mockData.find(p => p.id === id);
    return of(patient || mockData[0]).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  create(patient: Patient): Observable<Patient> {
    // Mock implementation
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return of(newPatient).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.post<Patient>(this.apiUrl, patient);
  }

  update(id: string, patient: Patient): Observable<Patient> {
    // Mock implementation
    const updatedPatient: Patient = {
      ...patient,
      id,
      updatedAt: new Date().toISOString()
    };
    return of(updatedPatient).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  delete(id: string): Observable<void> {
    // Mock implementation
    return of(undefined).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Mock data for development
  private getMockDataArray(): Patient[] {
    return [
      {
        id: '1',
        medicalRecordNumber: 'MRN-001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-05-15',
        gender: 'Male',
        email: 'john.doe@email.com',
        phone: '+1-555-0101',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0102',
        bloodType: 'O+',
        allergies: 'Penicillin',
        medicalHistory: 'Hypertension, managed with medication',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        medicalRecordNumber: 'MRN-002',
        firstName: 'Sarah',
        lastName: 'Smith',
        dateOfBirth: '1990-08-22',
        gender: 'Female',
        email: 'sarah.smith@email.com',
        phone: '+1-555-0201',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        emergencyContactName: 'Mike Smith',
        emergencyContactPhone: '+1-555-0202',
        bloodType: 'A+',
        allergies: 'None',
        medicalHistory: 'No significant medical history',
        createdAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z'
      },
      {
        id: '3',
        medicalRecordNumber: 'MRN-003',
        firstName: 'Michael',
        lastName: 'Johnson',
        dateOfBirth: '1978-12-03',
        gender: 'Male',
        email: 'michael.j@email.com',
        phone: '+1-555-0301',
        address: '789 Pine Road',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        emergencyContactName: 'Lisa Johnson',
        emergencyContactPhone: '+1-555-0302',
        bloodType: 'B+',
        allergies: 'Latex, Shellfish',
        medicalHistory: 'Type 2 Diabetes, Asthma',
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-14T10:00:00Z'
      }
    ];
  }

  private getMockPatients(): Observable<Patient[]> {
    return of(this.getMockDataArray()).pipe(delay(500));
  }
}

