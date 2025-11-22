import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { AuditLog, AuditLogFilter, AuditLogSummary, ComplianceReport, ChangeHistory } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.audit}`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }

  getFiltered(filters: AuditLogFilter): Observable<AuditLog[]> {
    let params = new HttpParams();
    
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate.toISOString());
    }
    if (filters.actorUserId) {
      params = params.set('actorUserId', filters.actorUserId);
    }
    if (filters.actorRole) {
      params = params.set('actorRole', filters.actorRole);
    }
    if (filters.action) {
      params = params.set('action', filters.action);
    }
    if (filters.entityType) {
      params = params.set('entityType', filters.entityType);
    }
    if (filters.entityId) {
      params = params.set('entityId', filters.entityId);
    }
    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }

    return this.http.get<AuditLog[]>(this.apiUrl, { params });
  }

  getByEntity(entityType: string, entityId: string): Observable<AuditLog[]> {
    return this.getFiltered({ entityType, entityId });
  }

  getByUser(userId: string): Observable<AuditLog[]> {
    return this.getFiltered({ actorUserId: userId });
  }

  getSummary(filters?: AuditLogFilter): Observable<AuditLogSummary> {
    const source = filters ? this.getFiltered(filters) : this.getAll();
    
    return source.pipe(
      map(logs => {
        const summary: AuditLogSummary = {
          totalActions: logs.length,
          actionsByType: {},
          actionsByRole: {},
          actionsByEntity: {},
          recentActivity: logs.slice(0, 10)
        };

        logs.forEach(log => {
          // Count by action type
          summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
          
          // Count by role
          summary.actionsByRole[log.actorRole] = (summary.actionsByRole[log.actorRole] || 0) + 1;
          
          // Count by entity
          summary.actionsByEntity[log.entityType] = (summary.actionsByEntity[log.entityType] || 0) + 1;
        });

        return summary;
      })
    );
  }

  getComplianceReport(startDate: Date, endDate: Date): Observable<ComplianceReport> {
    return this.getFiltered({ startDate, endDate }).pipe(
      map(logs => {
        const uniqueUsers = new Set(logs.map(l => l.actorUserId));
        const accessesByRole: { [key: string]: number } = {};
        const modificationsByEntity: { [key: string]: number } = {};
        const modificationsByUser: { [key: string]: number } = {};
        
        let totalAccesses = 0;
        let totalModifications = 0;
        let deletedRecords = 0;
        let restoredRecords = 0;
        let failedOperations = 0;

        const criticalActions: AuditLog[] = [];

        logs.forEach(log => {
          // Track accesses
          if (log.action === 'View' || log.action === 'Read' || log.action === 'Get') {
            totalAccesses++;
            accessesByRole[log.actorRole] = (accessesByRole[log.actorRole] || 0) + 1;
          }

          // Track modifications
          if (['Create', 'Update', 'Delete', 'Modify'].includes(log.action)) {
            totalModifications++;
            modificationsByEntity[log.entityType] = (modificationsByEntity[log.entityType] || 0) + 1;
            modificationsByUser[log.actorUserId] = (modificationsByUser[log.actorUserId] || 0) + 1;
          }

          // Track deletions
          if (log.action === 'Delete') {
            deletedRecords++;
            criticalActions.push(log);
          }

          // Track restorations
          if (log.action === 'Restore') {
            restoredRecords++;
          }

          // Track failures
          if (log.details.toLowerCase().includes('error') || log.details.toLowerCase().includes('failed')) {
            failedOperations++;
            criticalActions.push(log);
          }

          // Track critical actions
          if (['Delete', 'BulkDelete', 'Export', 'BulkExport'].includes(log.action)) {
            criticalActions.push(log);
          }
        });

        return {
          reportPeriod: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          totalAuditEntries: logs.length,
          accessLogs: {
            totalAccesses,
            uniqueUsers: uniqueUsers.size,
            accessesByRole
          },
          modificationLogs: {
            totalModifications,
            modificationsByEntity,
            modificationsByUser
          },
          criticalActions: criticalActions.slice(0, 50), // Top 50 critical actions
          dataIntegrity: {
            deletedRecords,
            restoredRecords,
            failedOperations
          }
        };
      })
    );
  }

  parseChangeHistory(details: string): ChangeHistory[] {
    // Parse details string to extract field changes
    // Format: "field1=oldValue->newValue, field2=oldValue->newValue"
    const changes: ChangeHistory[] = [];
    
    if (!details || !details.includes('->')) {
      return changes;
    }

    const changePattern = /(\w+)=([^->]+)->([^,]+)/g;
    let match;

    while ((match = changePattern.exec(details)) !== null) {
      changes.push({
        field: match[1],
        oldValue: match[2].trim(),
        newValue: match[3].trim(),
        changedBy: '', // Will be set from audit log
        changedAt: '' // Will be set from audit log
      });
    }

    return changes;
  }
}

