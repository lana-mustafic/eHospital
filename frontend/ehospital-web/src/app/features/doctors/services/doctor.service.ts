import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctors}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Doctor[]> {
    // Mock data for development - replace with real API call when backend is ready
    return this.getMockDoctors();
    
    // Uncomment when backend is ready:
    // return this.http.get<Doctor[]>(this.apiUrl);
  }

  getById(id: string): Observable<Doctor> {
    // Mock implementation
    const mockData = this.getMockDataArray();
    const doctor = mockData.find(d => d.id === id);
    return of(doctor || mockData[0]).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  create(doctor: Doctor): Observable<Doctor> {
    // Mock implementation
    const newDoctor: Doctor = {
      ...doctor,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return of(newDoctor).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.post<Doctor>(this.apiUrl, doctor);
  }

  update(id: string, doctor: Doctor): Observable<Doctor> {
    // Mock implementation
    const updatedDoctor: Doctor = {
      ...doctor,
      id,
      updatedAt: new Date().toISOString()
    };
    return of(updatedDoctor).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.put<Doctor>(`${this.apiUrl}/${id}`, doctor);
  }

  delete(id: string): Observable<void> {
    // Mock implementation
    return of(undefined).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Mock data for development
  private getMockDataArray(): Doctor[] {
    return [
      {
        id: '1',
        licenseNumber: 'MD-001',
        firstName: 'John',
        lastName: 'Smith',
        specialty: 'Cardiology',
        department: 'Cardiology',
        email: 'john.smith@ehospital.com',
        phone: '+1-555-1001',
        address: '123 Medical Center Dr',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        yearsOfExperience: 15,
        qualifications: 'MD, FACC',
        bio: 'Board-certified cardiologist with expertise in interventional cardiology',
        status: 'Active',
        schedule: 'Mon-Fri, 9:00 AM - 5:00 PM',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        licenseNumber: 'MD-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        specialty: 'Pediatrics',
        department: 'Pediatrics',
        email: 'sarah.johnson@ehospital.com',
        phone: '+1-555-1002',
        address: '456 Health Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        yearsOfExperience: 10,
        qualifications: 'MD, FAAP',
        bio: 'Pediatrician specializing in child development and preventive care',
        status: 'Active',
        schedule: 'Mon-Thu, 8:00 AM - 4:00 PM',
        createdAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z'
      },
      {
        id: '3',
        licenseNumber: 'MD-003',
        firstName: 'Michael',
        lastName: 'Brown',
        specialty: 'Emergency Medicine',
        department: 'Emergency Medicine',
        email: 'michael.brown@ehospital.com',
        phone: '+1-555-1003',
        address: '789 Emergency Way',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        yearsOfExperience: 12,
        qualifications: 'MD, FACEP',
        bio: 'Emergency medicine physician with trauma care expertise',
        status: 'Active',
        schedule: 'Rotating shifts',
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-14T10:00:00Z'
      }
    ];
  }

  private getMockDoctors(): Observable<Doctor[]> {
    return of(this.getMockDataArray()).pipe(delay(500));
  }
}

