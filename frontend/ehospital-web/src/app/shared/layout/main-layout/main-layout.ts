import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, Subscription } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  currentPageTitle = 'Dashboard';
  currentUser: User | null = null;
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;

  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { path: '/patients', icon: 'people', label: 'Patients', roles: ['Admin', 'Doctor', 'Nurse'] },
    { path: '/doctors', icon: 'medical_services', label: 'Doctors', roles: ['Admin'] },
    { path: '/appointments', icon: 'event', label: 'Appointments', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { path: '/departments', icon: 'business', label: 'Departments', roles: ['Admin'] },
    { path: '/medications', icon: 'medication', label: 'Medications', roles: ['Admin', 'Doctor'] },
    { path: '/schedules', icon: 'schedule', label: 'Schedules', roles: ['Admin', 'Doctor'] },
    { path: '/records', icon: 'folder_shared', label: 'Records', roles: ['Admin', 'Doctor'] },
    { path: '/vital-signs', icon: 'monitor_heart', label: 'Vital Signs', roles: ['Admin', 'Doctor', 'Nurse'] },
    { path: '/lab-tests', icon: 'science', label: 'Lab Tests', roles: ['Admin', 'Doctor', 'Nurse'] },
    { path: '/medical-history', icon: 'history', label: 'Medical History', roles: ['Admin', 'Doctor', 'Nurse'] },
    { path: '/discharge-summaries', icon: 'description', label: 'Discharge Summaries', roles: ['Admin', 'Doctor'] },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', roles: ['Admin', 'Doctor', 'Nurse', 'Patient'] },
    { path: '/invoices', icon: 'receipt', label: 'Billing & Invoices', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { path: '/diagnoses', icon: 'assignment', label: 'Diagnoses', roles: ['Admin', 'Doctor'] },
    { path: '/prescriptions', icon: 'receipt_long', label: 'Prescriptions', roles: ['Admin', 'Doctor'] },
    { path: '/reports', icon: 'assessment', label: 'Reports', roles: ['Admin'] }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user
    this.currentUser = this.authService.getCurrentUser();
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Update page title based on current route
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      )
      .subscribe(url => {
        const menuItem = this.menuItems.find(item => url.includes(item.path));
        this.currentPageTitle = menuItem ? menuItem.label : 'Dashboard';
      });

    // Set initial title
    const currentUrl = this.router.url;
    const menuItem = this.menuItems.find(item => currentUrl.includes(item.path));
    if (menuItem) {
      this.currentPageTitle = menuItem.label;
    }
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }

  get visibleMenuItems() {
    const userRole = this.currentUser?.role || '';
    return this.menuItems.filter(item =>
      !item.roles || item.roles.some(role => role.toLowerCase() === userRole.toLowerCase())
    );
  }
}

