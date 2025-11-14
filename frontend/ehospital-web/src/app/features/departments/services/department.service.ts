import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.departments}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    // Mock data for development - replace with real API call when backend is ready
    return this.getMockDepartments();
    
    // Uncomment when backend is ready:
    // return this.http.get<Department[]>(this.apiUrl);
  }

  // Mock data for development
  private getMockDataArray(): Department[] {
    return [
      {
        id: '1',
        name: 'Cardiology',
        description: 'Heart and cardiovascular system care',
        headOfDepartment: 'Dr. John Smith',
        contactEmail: 'cardiology@ehospital.com',
        contactPhone: '+1-234-567-8901',
        location: 'Building A, Floor 2',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Pediatrics',
        description: 'Medical care for infants, children, and adolescents',
        headOfDepartment: 'Dr. Sarah Johnson',
        contactEmail: 'pediatrics@ehospital.com',
        contactPhone: '+1-234-567-8902',
        location: 'Building B, Floor 1',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
      },
      {
        id: '3',
        name: 'Emergency Medicine',
        description: 'Emergency and urgent care services',
        headOfDepartment: 'Dr. Michael Brown',
        contactEmail: 'emergency@ehospital.com',
        contactPhone: '+1-234-567-8903',
        location: 'Building A, Floor 1',
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z'
      }
    ];
  }

  private getMockDepartments(): Observable<Department[]> {
    return of(this.getMockDataArray()).pipe(delay(500));
  }

  getById(id: string): Observable<Department> {
    // Mock implementation
    const mockData = this.getMockDataArray();
    const dept = mockData.find(d => d.id === id);
    return of(dept || mockData[0]).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  create(department: Department): Observable<Department> {
    // Mock implementation
    const newDept: Department = {
      ...department,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return of(newDept).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.post<Department>(this.apiUrl, department);
  }

  update(id: string, department: Department): Observable<Department> {
    // Mock implementation
    const updatedDept: Department = {
      ...department,
      id,
      updatedAt: new Date().toISOString()
    };
    return of(updatedDept).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  delete(id: string): Observable<void> {
    // Mock implementation
    return of(undefined).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

