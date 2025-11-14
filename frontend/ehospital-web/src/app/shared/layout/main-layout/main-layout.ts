import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, Subscription } from 'rxjs';

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
  private routerSubscription?: Subscription;

  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/patients', icon: 'people', label: 'Patients' },
    { path: '/doctors', icon: 'medical_services', label: 'Doctors' },
    { path: '/appointments', icon: 'event', label: 'Appointments' },
    { path: '/departments', icon: 'business', label: 'Departments' },
    { path: '/medications', icon: 'medication', label: 'Medications' },
    { path: '/reports', icon: 'assessment', label: 'Reports' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
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
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  }
}

