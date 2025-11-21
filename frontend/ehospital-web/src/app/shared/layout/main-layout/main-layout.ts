import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, map, Subscription } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, NotificationCenterComponent],
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
  showNotificationCenter = false;
  unreadNotificationCount = 0;
  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;
  private allMenuItemsCache: any[] = [];
  private searchTimeout?: any;
  private notificationPollingSubscription?: Subscription;

  menuSections = [
    {
      title: 'Overview',
      icon: 'dashboard',
      expanded: true,
      items: [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Nurse', 'Receptionist'] }
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
        { path: '/radiology', icon: 'image', label: 'Radiology & Imaging', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/medical-history', icon: 'history', label: 'Patient History', roles: ['Admin', 'Doctor', 'Nurse'] },
        { path: '/diagnoses', icon: 'assignment', label: 'Diagnoses', roles: ['Admin', 'Doctor'] },
        { path: '/prescriptions', icon: 'receipt_long', label: 'Prescriptions', roles: ['Admin', 'Doctor'] },
        { path: '/discharge-summaries', icon: 'description', label: 'Discharge Summaries', roles: ['Admin', 'Doctor'] },
        { path: '/clinical-decision-support', icon: 'psychology', label: 'Clinical Decision Support', roles: ['Admin', 'Doctor', 'Nurse'] }
      ]
    },
    {
      title: 'Operations',
      icon: 'business_center',
      expanded: true,
      items: [
        { path: '/queues', icon: 'queue', label: 'Queue Management', roles: ['Admin', 'Nurse', 'Receptionist'] },
        { path: '/emergency', icon: 'emergency', label: 'Emergency Department', roles: ['Admin', 'Nurse', 'Receptionist'] },
        { path: '/rooms', icon: 'hotel', label: 'Room Management', roles: ['Admin', 'Nurse', 'Receptionist'] },
        { path: '/pharmacy', icon: 'local_pharmacy', label: 'Pharmacy', roles: ['Admin', 'Nurse'] },
        { path: '/medications', icon: 'medication', label: 'Medication Inventory', roles: ['Admin'] },
        { path: '/invoices', icon: 'receipt', label: 'Billing & Finance', roles: ['Admin', 'Receptionist'] },
        { path: '/insurance', icon: 'verified_user', label: 'Insurance & Claims', roles: ['Admin', 'Receptionist'] },
        { path: '/bulk-operations', icon: 'batch_prediction', label: 'Bulk Operations', roles: ['Admin', 'Nurse', 'Receptionist'] },
        { path: '/wizards/patient-registration', icon: 'person_add', label: 'Patient Registration Wizard', roles: ['Admin', 'Nurse', 'Receptionist'] },
        { path: '/wizards/appointment-booking', icon: 'event_available', label: 'Appointment Booking Wizard', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] }
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
        { path: '/documents', icon: 'folder', label: 'Document Management', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
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
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Start with empty menu until user is loaded
    this.visibleMenuSections = [];
    
    // Get current user
    this.currentUser = this.authService.getCurrentUser();
    
    // Always fetch user to ensure we have the latest role
    this.authService.fetchCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.updateVisibleMenuSections();
      },
      error: (err) => {
        console.error('MainLayout - Error fetching user:', err);
        // Fallback to stored user if fetch fails
        if (this.currentUser) {
          this.updateVisibleMenuSections();
        }
      }
    });
    
    // Also subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.updateVisibleMenuSections();
        this.startNotificationPolling();
      }
    });

    // Start notification polling if user already exists
    if (this.currentUser?.id) {
      this.startNotificationPolling();
    }

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
    this.stopNotificationPolling();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }

  private updateVisibleMenuSections() {
    const userRole = this.currentUser?.role || '';
    
    if (!userRole) {
      // If no role, show empty menu (user not loaded yet)
      this.visibleMenuSections = [];
      return;
    }
    
    // Preserve expanded state from existing visibleMenuSections
    const expandedStates = new Map(
      this.visibleMenuSections.map(s => [s.title, s.expanded])
    );
    
    const normalizedUserRole = userRole.toLowerCase().trim();
    console.log('MainLayout - Filtering menu for role:', normalizedUserRole, 'User:', this.currentUser);
    
    this.visibleMenuSections = this.menuSections.map(section => {
      // Filter items based on user role - strict matching
      const filteredItems = section.items.filter(item => {
        // If no roles specified, deny access (safety)
        if (!item.roles || item.roles.length === 0) {
          return false;
        }
        
        // Check if user's role matches any of the allowed roles (case-insensitive)
        const hasAccess = item.roles.some(role => {
          const normalizedRole = role.toLowerCase().trim();
          return normalizedRole === normalizedUserRole;
        });
        
        return hasAccess;
      });
      
      // Only include sections that have at least one visible item
      if (filteredItems.length === 0) {
        return null;
      }
      
      return {
        ...section,
        expanded: expandedStates.has(section.title) ? expandedStates.get(section.title) : section.expanded,
        items: filteredItems
      };
    }).filter(section => section !== null) as any[];
    
    // Force change detection to update the view
    this.cdr.detectChanges();
    
    const visibleSections = this.visibleMenuSections.map(s => ({ 
      title: s.title, 
      items: s.items.map((i: any) => i.label) 
    }));
    console.log('MainLayout - Final visible sections for', normalizedUserRole + ':', visibleSections);
    console.log('MainLayout - Total sections:', visibleSections.length);
    visibleSections.forEach(section => {
      console.log(`  - ${section.title}: ${section.items.length} items - ${section.items.join(', ')}`);
    });
    
    // Also log what should NOT be visible (for debugging)
    const allAdminItems = this.menuSections
      .flatMap(s => s.items)
      .filter(item => item.roles && !item.roles.some((r: string) => r.toLowerCase() === normalizedUserRole))
      .map(item => item.label);
    if (allAdminItems.length > 0) {
      console.log('MainLayout - Items that should NOT be visible for', normalizedUserRole + ':', allAdminItems);
    }
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

  canAccessDashboard(): boolean {
    const role = this.currentUser?.role?.toLowerCase();
    return ['admin', 'nurse', 'receptionist'].includes(role || '');
  }

  getDashboardRoute(): string[] {
    const role = this.currentUser?.role?.toLowerCase();
    if (role === 'doctor' || role === 'patient') {
      return ['/my/home'];
    }
    return ['/dashboard'];
  }

  startNotificationPolling(): void {
    this.stopNotificationPolling();
    
    if (!this.currentUser?.id) return;

    // Load initial count
    this.loadUnreadNotificationCount();

    // Poll every 30 seconds
    this.notificationPollingSubscription = this.notificationService.getUnreadCount(Number(this.currentUser.id))
      .subscribe({
        next: (data) => {
          this.unreadNotificationCount = data.count;
        },
        error: () => {
          // Silently fail
        }
      });

    // Set up interval polling
    setInterval(() => {
      if (this.currentUser?.id) {
        this.loadUnreadNotificationCount();
      }
    }, 30000);
  }

  stopNotificationPolling(): void {
    if (this.notificationPollingSubscription) {
      this.notificationPollingSubscription.unsubscribe();
      this.notificationPollingSubscription = undefined;
    }
  }

  loadUnreadNotificationCount(): void {
    if (!this.currentUser?.id) return;
    
    this.notificationService.getUnreadCount(Number(this.currentUser.id)).subscribe({
      next: (data) => {
        this.unreadNotificationCount = data.count;
      },
      error: () => {
        // Silently fail
      }
    });
  }

  toggleNotificationCenter(): void {
    this.showNotificationCenter = !this.showNotificationCenter;
  }

  closeNotificationCenter(): void {
    this.showNotificationCenter = false;
  }
}

