import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Call logout endpoint if needed
    this.http.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.logout}`, {}).subscribe({
      next: () => this.clearAuth(),
      error: () => this.clearAuth() // Clear even if API call fails
    });
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // For development/testing - remove in production
  mockLogin(email: string, password: string): Observable<LoginResponse> {
    // Mock response for development
    const mockResponse: LoginResponse = {
      token: 'mock_jwt_token_' + Date.now() + '.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })),
      user: {
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'admin'
      }
    };

    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        this.setToken(mockResponse.token);
        this.setUser(mockResponse.user);
        this.currentUserSubject.next(mockResponse.user);
        observer.next(mockResponse);
        observer.complete();
      }, 500);
    });
  }
}
