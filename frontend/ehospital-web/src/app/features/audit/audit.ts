import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLog, AuditService } from './services/audit.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.html',
  styleUrls: ['./audit.scss']
})
export class AuditComponent implements OnInit {
  logs: AuditLog[] = [];
  isLoading = false;

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.auditService.getAll().subscribe({
      next: (data) => { this.logs = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}

