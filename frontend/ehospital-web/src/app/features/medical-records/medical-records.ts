import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecord, MedicalRecordService } from './services/medical-record.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-records.html',
  styleUrls: ['./medical-records.scss']
})
export class MedicalRecordsComponent implements OnInit {
  records: MedicalRecord[] = [];
  isLoading = false;

  constructor(private recordService: MedicalRecordService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.recordService.getAll().subscribe({
      next: (data) => { this.records = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}

