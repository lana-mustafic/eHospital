export interface AuditLog {
  id: number;
  timestampUtc: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  actorName?: string; // Optional: resolved from user service
  ipAddress?: string; // Optional: if tracked
}

export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  actorUserId?: string;
  actorRole?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  searchTerm?: string;
}

export interface AuditLogSummary {
  totalActions: number;
  actionsByType: { [key: string]: number };
  actionsByRole: { [key: string]: number };
  actionsByEntity: { [key: string]: number };
  recentActivity: AuditLog[];
}

export interface ChangeHistory {
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  changeReason?: string;
}

export interface ComplianceReport {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  totalAuditEntries: number;
  accessLogs: {
    totalAccesses: number;
    uniqueUsers: number;
    accessesByRole: { [key: string]: number };
  };
  modificationLogs: {
    totalModifications: number;
    modificationsByEntity: { [key: string]: number };
    modificationsByUser: { [key: string]: number };
  };
  criticalActions: AuditLog[];
  dataIntegrity: {
    deletedRecords: number;
    restoredRecords: number;
    failedOperations: number;
  };
}

