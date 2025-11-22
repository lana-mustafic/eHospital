import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { ComplianceReport } from '../../models/audit-log.model';

@Component({
  selector: 'app-compliance-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compliance-report.component.html',
  styleUrls: ['./compliance-report.component.scss']
})
export class ComplianceReportComponent implements OnInit {
  report: ComplianceReport | null = null;
  isLoading = false;
  error: string | null = null;

  // Date range
  startDate: string = '';
  endDate: string = '';

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.endDate = endDate.toISOString().split('T')[0];
    this.startDate = startDate.toISOString().split('T')[0];

    this.generateReport();
  }

  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      this.error = 'Please select both start and end dates';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);

    this.auditService.getComplianceReport(start, end).subscribe({
      next: (data) => {
        this.report = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to generate compliance report';
        this.isLoading = false;
        console.error('Error generating compliance report:', err);
      }
    });
  }

  exportToPDF(): void {
    // TODO: Implement PDF export
    window.print();
  }

  exportToCSV(): void {
    if (!this.report) return;

    const rows: string[] = [];
    rows.push('Compliance Report');
    rows.push(`Period: ${this.report.reportPeriod.startDate} to ${this.report.reportPeriod.endDate}`);
    rows.push('');
    rows.push('Summary');
    rows.push(`Total Audit Entries,${this.report.totalAuditEntries}`);
    rows.push('');
    rows.push('Access Logs');
    rows.push(`Total Accesses,${this.report.accessLogs.totalAccesses}`);
    rows.push(`Unique Users,${this.report.accessLogs.uniqueUsers}`);
    rows.push('Role,Accesses');
    Object.entries(this.report.accessLogs.accessesByRole).forEach(([role, count]) => {
      rows.push(`${role},${count}`);
    });
    rows.push('');
    rows.push('Modification Logs');
    rows.push(`Total Modifications,${this.report.modificationLogs.totalModifications}`);
    rows.push('Entity Type,Modifications');
    Object.entries(this.report.modificationLogs.modificationsByEntity).forEach(([entity, count]) => {
      rows.push(`${entity},${count}`);
    });
    rows.push('');
    rows.push('Data Integrity');
    rows.push(`Deleted Records,${this.report.dataIntegrity.deletedRecords}`);
    rows.push(`Restored Records,${this.report.dataIntegrity.restoredRecords}`);
    rows.push(`Failed Operations,${this.report.dataIntegrity.failedOperations}`);

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getEntries(obj: { [key: string]: any }): [string, any][] {
    return Object.entries(obj);
  }
}

