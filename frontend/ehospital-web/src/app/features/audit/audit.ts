import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditTrailComponent } from './components/audit-trail/audit-trail.component';
import { ComplianceReportComponent } from './components/compliance-report/compliance-report.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, AuditTrailComponent, ComplianceReportComponent],
  templateUrl: './audit.html',
  styleUrls: ['./audit.scss']
})
export class AuditComponent {
  activeTab: 'trail' | 'compliance' = 'trail';

  setTab(tab: 'trail' | 'compliance'): void {
    this.activeTab = tab;
  }
}

