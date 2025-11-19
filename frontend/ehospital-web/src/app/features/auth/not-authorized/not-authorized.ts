import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-authorized.html',
  styleUrls: ['./not-authorized.scss']
})
export class NotAuthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    const user = this.authService.getCurrentUser();
    const role = user?.role?.toLowerCase();
    
    if (role === 'doctor' || role === 'patient') {
      this.router.navigate(['/my/home']);
    } else if (['admin', 'nurse', 'receptionist'].includes(role || '')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

