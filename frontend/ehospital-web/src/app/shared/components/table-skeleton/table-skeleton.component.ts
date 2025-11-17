import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="table-skeleton">
      <table class="skeleton-table">
        <thead>
          <tr>
            @for (header of headerArray(); track $index) {
              <th>
                <app-skeleton type="text" width="80%" height="1.2em"></app-skeleton>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rowArray(); track $index) {
            <tr>
              @for (header of headerArray(); track $index) {
                <td>
                  <app-skeleton type="text" width="70%" height="1em"></app-skeleton>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-skeleton {
      width: 100%;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .skeleton-table {
      width: 100%;
      border-collapse: collapse;
    }

    .skeleton-table thead {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .skeleton-table th {
      padding: 1rem;
      text-align: left;
    }

    .skeleton-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .skeleton-table tbody tr:last-child td {
      border-bottom: none;
    }
  `]
})
export class TableSkeletonComponent {
  @Input() headers: number = 5;
  @Input() rows: number = 5;
  
  headerArray() {
    return Array.from({ length: this.headers }, (_, i) => i);
  }
  
  rowArray() {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}

