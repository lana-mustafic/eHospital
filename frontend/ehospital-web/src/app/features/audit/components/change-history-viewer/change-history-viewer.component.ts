import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit.service';
import { AuditLog, ChangeHistory } from '../../models/audit-log.model';

@Component({
  selector: 'app-change-history-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-history-viewer.component.html',
  styleUrls: ['./change-history-viewer.component.scss']
})
export class ChangeHistoryViewerComponent implements OnInit {
  @Input() entityType!: string;
  @Input() entityId!: string;
  @Input() showTitle = true;

  auditLogs: AuditLog[] = [];
  changeHistory: ChangeHistory[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(public auditService: AuditService) {}

  ngOnInit(): void {
    if (this.entityType && this.entityId) {
      this.loadChangeHistory();
    }
  }

  loadChangeHistory(): void {
    this.isLoading = true;
    this.error = null;

    this.auditService.getByEntity(this.entityType, this.entityId).subscribe({
      next: (logs) => {
        this.auditLogs = logs.sort((a, b) => 
          new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime()
        );
        
        // Parse change history from logs
        this.changeHistory = [];
        this.auditLogs.forEach(log => {
          if (log.action === 'Update' || log.action === 'Modify') {
            const changes = this.auditService.parseChangeHistory(log.details);
            changes.forEach(change => {
              change.changedBy = log.actorUserId;
              change.changedAt = log.timestampUtc;
            });
            this.changeHistory.push(...changes);
          }
        });

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load change history';
        this.isLoading = false;
        console.error('Error loading change history:', err);
      }
    });
  }

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'Create': 'add_circle',
      'Update': 'edit',
      'Delete': 'delete',
      'View': 'visibility',
      'Read': 'description',
      'Export': 'file_download',
      'Print': 'print'
    };
    return iconMap[action] || 'info';
  }

  getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'Create': 'success',
      'Update': 'primary',
      'Delete': 'danger',
      'View': 'info',
      'Read': 'info',
      'Export': 'warning',
      'Print': 'warning'
    };
    return colorMap[action] || 'default';
  }
}

