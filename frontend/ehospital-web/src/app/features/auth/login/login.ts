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
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
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
        // If role is Patient, route to patient portal unless an explicit returnUrl was set
        if (!this.returnUrl || this.returnUrl === '/dashboard') {
          if (user && user.role && user.role.toLowerCase() === 'patient') {
            this.router.navigate(['/my/home']);
            return;
          }
        }
        this.router.navigate([this.returnUrl || '/dashboard']);
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
