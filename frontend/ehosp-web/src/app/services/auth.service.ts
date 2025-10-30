import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService();

  constructor(private apiService: ApiService, private router: Router) { }

  login(credentials: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService.login(credentials).subscribe({
        next: (response: any) => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          resolve(true);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  register(userData: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService.register(userData).subscribe({
        next: (response: any) => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          resolve(true);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roleName === 'Admin';
  }

  isDoctor(): boolean {
    const user = this.getCurrentUser();
    return user?.roleName === 'Doctor';
  }

  isPatient(): boolean {
    const user = this.getCurrentUser();
    return user?.roleName === 'Patient';
  }
}