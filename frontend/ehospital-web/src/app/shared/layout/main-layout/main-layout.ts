import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, map, Subscription } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  currentPageTitle = 'Dashboard';
  currentUser: User | null = null;
  visibleMenuSections: any[] = [];
  globalSearchTerm = '';
  showSearchSuggestions = false;
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  private allMenuItemsCache: any[] = [];
  private searchTimeout?: any;

  menuSections = [
    {
      title: 'Overview',
      icon: 'dashboard',
      expanded: true,
      items: [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] }
      ]
    },
    {
      title: 'Clinical',
      icon: 'medical_services',
      expanded: true,
      items: [
        { path: '/patients', icon: 'people', label: 'Patient Registry', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/appointments', icon: 'event', label: 'Appointments', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { path: '/records', icon: 'folder_shared', label: 'Medical Records', roles: ['Admin', 'Doctor'] },
        { path: '/vital-signs', icon: 'monitor_heart', label: 'Vital Signs', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/lab-tests', icon: 'science', label: 'Laboratory', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/medical-history', icon: 'history', label: 'Patient History', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/diagnoses', icon: 'assignment', label: 'Diagnoses', roles: ['Admin', 'Doctor'] },
        { path: '/prescriptions', icon: 'receipt_long', label: 'Prescriptions', roles: ['Admin', 'Doctor'] },
        { path: '/discharge-summaries', icon: 'description', label: 'Discharge Summaries', roles: ['Admin', 'Doctor'] }
      ]
    },
    {
      title: 'Operations',
      icon: 'business_center',
      expanded: true,
      items: [
        { path: '/queues', icon: 'queue', label: 'Queue Management', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { path: '/emergency', icon: 'emergency', label: 'Emergency Department', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { path: '/rooms', icon: 'hotel', label: 'Room Management', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { path: '/pharmacy', icon: 'local_pharmacy', label: 'Pharmacy', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/medications', icon: 'medication', label: 'Medication Inventory', roles: ['Admin', 'Doctor'] },
        { path: '/invoices', icon: 'receipt', label: 'Billing & Finance', roles: ['Admin', 'Doctor', 'Receptionist'] }
      ]
    },
    {
      title: 'Administration',
      icon: 'admin_panel_settings',
      expanded: false,
      items: [
        { path: '/doctors', icon: 'medical_services', label: 'Physician Management', roles: ['Admin'] },
        { path: '/schedules', icon: 'schedule', label: 'Staff Schedules', roles: ['Admin', 'Doctor'] },
        { path: '/departments', icon: 'business', label: 'Departments', roles: ['Admin'] },
        { path: '/reports', icon: 'assessment', label: 'Reports & Analytics', roles: ['Admin'] },
        { path: '/audit', icon: 'history', label: 'Audit Trail', roles: ['Admin'] }
      ]
    },
    {
      title: 'System',
      icon: 'settings',
      expanded: false,
      items: [
        { path: '/notifications', icon: 'notifications', label: 'Notifications', roles: ['Admin', 'Doctor', 'Nurse', 'Patient'] }
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

  getCurrentTime(): string {
    return new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  performGlobalSearch(): void {
    if (!this.globalSearchTerm.trim()) return;
    
    // Navigate to patients page with search term
    this.router.navigate(['/patients'], {
      queryParams: { search: this.globalSearchTerm }
    });
    this.showSearchSuggestions = false;
  }

  searchPatients(): void {
    if (this.globalSearchTerm.trim()) {
      this.router.navigate(['/patients'], {
        queryParams: { search: this.globalSearchTerm }
      });
    } else {
      this.router.navigate(['/patients']);
    }
    this.showSearchSuggestions = false;
  }

  searchAppointments(): void {
    if (this.globalSearchTerm.trim()) {
      this.router.navigate(['/appointments'], {
        queryParams: { search: this.globalSearchTerm }
      });
    } else {
      this.router.navigate(['/appointments']);
    }
    this.showSearchSuggestions = false;
  }

  searchRecords(): void {
    if (this.globalSearchTerm.trim()) {
      this.router.navigate(['/records'], {
        queryParams: { search: this.globalSearchTerm }
      });
    } else {
      this.router.navigate(['/records']);
    }
    this.showSearchSuggestions = false;
  }

  hideSearchSuggestions(): void {
    // Delay hiding to allow click events
    setTimeout(() => {
      this.showSearchSuggestions = false;
    }, 200);
  }
}

