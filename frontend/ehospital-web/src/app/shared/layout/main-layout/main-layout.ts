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
  visibleMenuSections: any[] = [];
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  private allMenuItemsCache: any[] = [];

  menuSections = [
    {
      title: 'Main',
      icon: 'home',
      expanded: true,
      items: [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] }
      ]
    },
    {
      title: 'Patient Management',
      icon: 'people',
      expanded: true,
      items: [
        { path: '/patients', icon: 'people', label: 'Patients', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/records', icon: 'folder_shared', label: 'Records', roles: ['Admin', 'Doctor'] },
        { path: '/vital-signs', icon: 'monitor_heart', label: 'Vital Signs', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/lab-tests', icon: 'science', label: 'Lab Tests', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/medical-history', icon: 'history', label: 'Medical History', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/discharge-summaries', icon: 'description', label: 'Discharge Summaries', roles: ['Admin', 'Doctor'] }
      ]
    },
    {
      title: 'Staff',
      icon: 'groups',
      expanded: true,
      items: [
        { path: '/doctors', icon: 'medical_services', label: 'Doctors', roles: ['Admin'] },
        { path: '/schedules', icon: 'schedule', label: 'Schedules', roles: ['Admin', 'Doctor'] }
      ]
    },
    {
      title: 'Administration',
      icon: 'settings',
      expanded: true,
      items: [
        { path: '/departments', icon: 'business', label: 'Departments', roles: ['Admin'] },
        { path: '/medications', icon: 'medication', label: 'Medications', roles: ['Admin', 'Doctor'] },
        { path: '/appointments', icon: 'event', label: 'Appointments', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { path: '/pharmacy', icon: 'local_pharmacy', label: 'Pharmacy', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/rooms', icon: 'hotel', label: 'Rooms & Beds', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { path: '/invoices', icon: 'receipt', label: 'Billing & Invoices', roles: ['Admin', 'Doctor', 'Receptionist'] },
        { path: '/diagnoses', icon: 'assignment', label: 'Diagnoses', roles: ['Admin', 'Doctor'] },
        { path: '/prescriptions', icon: 'receipt_long', label: 'Prescriptions', roles: ['Admin', 'Doctor'] },
        { path: '/reports', icon: 'assessment', label: 'Reports', roles: ['Admin'] }
      ]
    },
    {
      title: 'System',
      icon: 'settings_applications',
      expanded: false,
      items: [
        { path: '/notifications', icon: 'notifications', label: 'Notifications', roles: ['Admin', 'Doctor', 'Nurse', 'Patient'] },
        { path: '/audit', icon: 'history', label: 'Audit Log', roles: ['Admin'] }
      ]
    }
  ];

  // Flattened menu items for page title lookup (cached)
  get allMenuItems() {
    if (this.allMenuItemsCache.length === 0) {
      this.allMenuItemsCache = this.menuSections.flatMap(section => section.items);
    }
    return this.allMenuItemsCache;
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user
    this.currentUser = this.authService.getCurrentUser();
    this.updateVisibleMenuSections();
    
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateVisibleMenuSections();
    });

    // Update page title based on current route
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      )
      .subscribe(url => {
        const menuItem = this.allMenuItems.find(item => url.includes(item.path));
        this.currentPageTitle = menuItem ? menuItem.label : 'Dashboard';
      });

    // Set initial title
    const currentUrl = this.router.url;
    const menuItem = this.allMenuItems.find(item => currentUrl.includes(item.path));
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

  private updateVisibleMenuSections() {
    const userRole = this.currentUser?.role || '';
    // Preserve expanded state from existing visibleMenuSections
    const expandedStates = new Map(
      this.visibleMenuSections.map(s => [s.title, s.expanded])
    );
    
    this.visibleMenuSections = this.menuSections.map(section => {
      const filteredItems = section.items.filter(item =>
        !item.roles || item.roles.some(role => role.toLowerCase() === userRole.toLowerCase())
      );
      
      if (filteredItems.length === 0) {
        return null;
      }
      
      return {
        ...section,
        expanded: expandedStates.has(section.title) ? expandedStates.get(section.title) : section.expanded,
        items: filteredItems
      };
    }).filter(section => section !== null) as any[];
  }

  toggleSection(section: any) {
    section.expanded = !section.expanded;
  }

  trackBySectionTitle(index: number, section: any): string {
    return section.title;
  }

  trackByItemPath(index: number, item: any): string {
    return item.path;
  }
}

