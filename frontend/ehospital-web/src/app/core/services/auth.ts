import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError, switchMap } from 'rxjs';
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

  login(credentials: LoginRequest): Observable<User> {
    console.log('Attempting login to:', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`);
    console.log('Login credentials:', { email: credentials.email, password: '***' });
    
    return this.http.post<any>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login response received:', response);
          
          // Handle different response formats
          let token: string | undefined;
          let user: any;
          
          // Check if response is wrapped in a data property
          if (response.data) {
            token = response.data.token || response.data.accessToken || response.data.jwtToken;
            user = response.data.user || response.data.userData;
          } else {
            // Direct response format
            token = response.token || response.accessToken || response.jwtToken;
            user = response.user || response.userData;
          }
          
          // Handle different user object structures
          if (user) {
            if (!token) {
              console.error('No token found in response:', response);
              throw new Error('No authentication token received');
            }
            this.setToken(token);
          } else {
            console.error('No user data found in response:', response);
            throw new Error('No user data received');
          }
        }),
        switchMap(() => this.fetchCurrentUser()),
        catchError((error: HttpErrorResponse) => {
          console.error('Login HTTP error:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          return throwError(() => error);
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

  fetchCurrentUser(): Observable<User> {
    return this.http.get<any>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.me}`).pipe(
      // Normalize API UserDto -> frontend User
      tap((dto) => {
        const user: User = {
          id: (dto.id ?? dto.userId ?? '').toString(),
          email: dto.email ?? '',
          name: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim() || (dto.name ?? 'User'),
          role: dto.roleName ?? dto.role ?? 'user'
        };
        this.setUser(user);
        this.currentUserSubject.next(user);
      }),
      // Return the normalized user as the observable value
      switchMap(() => {
        const u = this.getCurrentUser();
        return u ? new Observable<User>(obs => { obs.next(u); obs.complete(); }) : throwError(() => new Error('Failed to load user'));
      })
    );
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    const userRole = (user.role ?? '').toLowerCase();
    if (!userRole) {
      return false;
    }
    return roles.some(r => (r ?? '').toLowerCase() === userRole);
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
