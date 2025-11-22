import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AuditService } from '../../services/audit.service';
import { AuditLog, AuditLogFilter } from '../../models/audit-log.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss']
})
export class AuditTrailComponent implements OnInit, OnDestroy {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  isLoading = false;
  error: string | null = null;

  // Filters
  filters: AuditLogFilter = {};
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Date range
  startDate: string = '';
  endDate: string = '';

  // Filter options
  availableRoles: string[] = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'];
  availableActions: string[] = ['Create', 'Update', 'Delete', 'View', 'Read', 'Export', 'Print'];
  availableEntityTypes: string[] = [
    'Patient', 'Appointment', 'MedicalRecord', 'Prescription', 
    'Diagnosis', 'Medication', 'Doctor', 'Department', 'Invoice'
  ];

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'timestampUtc', label: 'Timestamp', sortable: true },
    { key: 'actorUserId', label: 'User ID', sortable: true },
    { key: 'actorRole', label: 'Role', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'entityType', label: 'Entity Type', sortable: true },
    { key: 'entityId', label: 'Entity ID', sortable: true },
    { key: 'details', label: 'Details', sortable: false }
  ];

  private destroy$ = new Subject<void>();

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.endDate = endDate.toISOString().split('T')[0];
    this.startDate = startDate.toISOString().split('T')[0];
    this.filters.startDate = startDate;
    this.filters.endDate = endDate;

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filters.searchTerm = term;
      this.loadLogs();
    });

    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.error = null;

    // Update date filters
    if (this.startDate) {
      this.filters.startDate = new Date(this.startDate);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // End of day
      this.filters.endDate = end;
    }

    this.auditService.getFiltered(this.filters).subscribe({
      next: (data) => {
        this.logs = data;
        this.filteredLogs = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load audit logs';
        this.isLoading = false;
        console.error('Error loading audit logs:', err);
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.loadLogs();
  }

  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    this.startDate = startDate.toISOString().split('T')[0];
    this.endDate = endDate.toISOString().split('T')[0];
    this.filters.startDate = startDate;
    this.filters.endDate = endDate;
    this.loadLogs();
  }

  exportToCSV(): void {
    const headers = ['Timestamp', 'User ID', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = this.filteredLogs.map(log => [
      new Date(log.timestampUtc).toLocaleString(),
      log.actorUserId,
      log.actorRole,
      log.action,
      log.entityType,
      log.entityId,
      log.details
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getActionClass(action: string): string {
    const actionMap: { [key: string]: string } = {
      'Create': 'action-create',
      'Update': 'action-update',
      'Delete': 'action-delete',
      'View': 'action-view',
      'Read': 'action-read',
      'Export': 'action-export',
      'Print': 'action-print'
    };
    return actionMap[action] || 'action-default';
  }
}

