import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../../core/services/export.service';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellTemplate?: TemplateRef<any>;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() selectable: boolean = false;
  @Input() sortable: boolean = true;
  @Input() exportable: boolean = true;
  @Input() printable: boolean = true;
  @Input() columnCustomizable: boolean = true;
  @Input() tableTitle: string = 'Data Table';
  @Input() emptyMessage: string = 'No data available';
  @Input() loading: boolean = false;
  
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<SortConfig>();
  @Output() exportExcel = new EventEmitter<void>();
  @Output() exportPDF = new EventEmitter<void>();
  @Output() exportCSV = new EventEmitter<void>();

  sortedData: any[] = [];
  selectedRows: Set<any> = new Set();
  sortConfig: SortConfig | null = null;
  showColumnMenu: boolean = false;
  showExportMenu: boolean = false;
  showBulkActions: boolean = false;

  constructor(private exportService: ExportService) {}

  ngOnInit() {
    this.initializeColumns();
    this.sortedData = [...this.data];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.sortedData = [...this.data];
      if (this.sortConfig) {
        this.applySorting();
      }
    }
    if (changes['columns']) {
      this.initializeColumns();
    }
  }

  initializeColumns() {
    // Ensure all columns have default visibility
    this.columns = this.columns.map(col => ({
      ...col,
      visible: col.visible !== false,
      sortable: col.sortable !== false
    }));
  }

  get visibleColumns(): TableColumn[] {
    return this.columns.filter(col => col.visible !== false);
  }

  onSort(column: TableColumn) {
    if (!column.sortable || !this.sortable) return;

    if (this.sortConfig?.column === column.key) {
      // Toggle direction
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortConfig = { column: column.key, direction: 'asc' };
    }

    this.applySorting();
    this.sortChange.emit(this.sortConfig);
  }

  applySorting() {
    if (!this.sortConfig) return;

    const { column, direction } = this.sortConfig;
    this.sortedData = [...this.data].sort((a, b) => {
      const aVal = this.getNestedValue(a, column);
      const bVal = this.getNestedValue(b, column);

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  getSortIcon(column: TableColumn): string {
    if (!this.sortConfig || this.sortConfig.column !== column.key) {
      return 'unfold_more';
    }
    return this.sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onRowSelect(row: any, event: Event) {
    event.stopPropagation();
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.updateSelection();
  }

  onSelectAll(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedRows = new Set(this.sortedData);
    } else {
      this.selectedRows.clear();
    }
    this.updateSelection();
  }

  isAllSelected(): boolean {
    return this.sortedData.length > 0 && this.selectedRows.size === this.sortedData.length;
  }

  isIndeterminate(): boolean {
    return this.selectedRows.size > 0 && this.selectedRows.size < this.sortedData.length;
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  updateSelection() {
    this.showBulkActions = this.selectedRows.size > 0;
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  toggleColumnVisibility(column: TableColumn) {
    column.visible = !column.visible;
  }

  toggleColumnMenu() {
    this.showColumnMenu = !this.showColumnMenu;
    if (this.showColumnMenu) {
      this.showExportMenu = false;
    }
  }

  toggleExportMenu() {
    this.showExportMenu = !this.showExportMenu;
    if (this.showExportMenu) {
      this.showColumnMenu = false;
    }
  }

  onExportExcel() {
    if (this.sortedData.length === 0) return;
    
    const headers = this.visibleColumns.map(col => col.label);
    const data = this.sortedData.map(row => {
      const obj: any = {};
      this.visibleColumns.forEach(col => {
        obj[col.label] = this.getNestedValue(row, col.key) ?? '—';
      });
      return obj;
    });

    this.exportService.exportToExcel(data, this.tableTitle, headers);
    this.exportExcel.emit();
  }

  onExportPDF() {
    if (this.sortedData.length === 0) return;
    
    const headers = this.visibleColumns.map(col => col.label);
    const data = this.sortedData.map(row => {
      const obj: any = {};
      this.visibleColumns.forEach(col => {
        obj[col.label] = this.getNestedValue(row, col.key) ?? '—';
      });
      return obj;
    });

    this.exportService.exportToPDF(data, this.tableTitle.toLowerCase().replace(/\s+/g, '_'), headers, this.tableTitle);
    this.exportPDF.emit();
  }

  onExportCSV() {
    if (this.sortedData.length === 0) return;
    
    const headers = this.visibleColumns.map(col => col.label);
    const data = this.sortedData.map(row => {
      const obj: any = {};
      this.visibleColumns.forEach(col => {
        obj[col.label] = this.getNestedValue(row, col.key) ?? '—';
      });
      return obj;
    });

    this.exportService.exportToCSV(data, this.tableTitle.toLowerCase().replace(/\s+/g, '_'), headers);
    this.exportCSV.emit();
  }

  onPrint() {
    window.print();
  }

  clearSelection() {
    this.selectedRows.clear();
    this.updateSelection();
  }

  getSelectedCount(): number {
    return this.selectedRows.size;
  }
}

