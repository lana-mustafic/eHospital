import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  /**
   * Export data to CSV file
   */
  exportToCSV(data: any[], filename: string, headers: string[]): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create CSV content
    const csvContent = this.convertToCSV(data, headers);
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${this.getFormattedDate()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Convert data array to CSV string
   */
  private convertToCSV(data: any[], headers: string[]): string {
    // CSV header row
    const headerRow = headers.map(h => this.escapeCSVValue(h)).join(',');
    
    // CSV data rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = this.getNestedValue(row, header);
        return this.escapeCSVValue(value);
      }).join(',');
    });
    
    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? '';
  }

  /**
   * Escape CSV value (handle commas, quotes, newlines)
   */
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Export data to PDF (using browser print functionality)
   * For a more advanced PDF, you would use a library like jsPDF or pdfmake
   */
  exportToPDF(data: any[], filename: string, headers: string[], title: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create HTML table
    const html = this.generatePDFHTML(data, headers, title);
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        // Optionally close after print
        // printWindow.close();
      }, 250);
    }
  }

  /**
   * Generate HTML for PDF export
   */
  private generatePDFHTML(data: any[], headers: string[], title: string): string {
    const headerRow = headers.map(h => `<th>${this.escapeHTML(h)}</th>`).join('');
    const dataRows = data.map(row => {
      const cells = headers.map(header => {
        const value = this.getNestedValue(row, header);
        return `<td>${this.escapeHTML(String(value))}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              color: #333;
              border-bottom: 2px solid #667eea;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #667eea;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>${headerRow}</tr>
            </thead>
            <tbody>
              ${dataRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Total records: ${data.length}</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get formatted date string for filename
   */
  private getFormattedDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
  }
}

