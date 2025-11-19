import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Get return url from route parameters or default to '/' (which will trigger roleRedirectGuard)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      const role = user?.role?.toLowerCase();
      if (role === 'doctor' || role === 'patient') {
        this.router.navigate(['/my/home']);
      } else {
        this.router.navigate([this.returnUrl || '/']);
      }
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        this.toastService.success('Login successful');
        // Get the current user from the service to ensure role is loaded
        const currentUser = this.authService.getCurrentUser();
        console.log('Login - Current user after login:', currentUser);
        const role = currentUser?.role?.toLowerCase() || user?.role?.toLowerCase();
        console.log('Login - User role:', role);
        
        if (role === 'doctor' || role === 'patient') {
          // Doctors and patients go to their portal
          console.log('Login - Redirecting to /my/home');
          this.router.navigate(['/my/home'], { replaceUrl: true });
        } else if (['admin', 'nurse', 'receptionist'].includes(role || '')) {
          // Staff go to dashboard
          console.log('Login - Redirecting to /dashboard');
          this.router.navigate([this.returnUrl || '/dashboard'], { replaceUrl: true });
        } else {
          // Default: let roleRedirectGuard handle it
          console.log('Login - Redirecting to / (will trigger roleRedirectGuard)');
          this.router.navigate(['/'], { replaceUrl: true });
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        // Handle different error response formats
        let errorMsg = 'Login failed';
        if (error.error) {
          if (error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error.error) {
            errorMsg = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else {
            errorMsg = `Login failed: ${error.status} ${error.statusText || 'Unknown error'}`;
          }
        } else {
          errorMsg = `Login failed: ${error.status} ${error.statusText || 'Unknown error'}`;
        }
        
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
