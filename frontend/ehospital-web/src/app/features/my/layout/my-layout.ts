import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './my-layout.html',
  styleUrls: ['./my-layout.scss']
})
export class MyLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('MyLayoutComponent - Current user:', this.currentUser);
    console.log('MyLayoutComponent - User role:', this.currentUser?.role);
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('MyLayoutComponent - User updated:', user);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }
}

