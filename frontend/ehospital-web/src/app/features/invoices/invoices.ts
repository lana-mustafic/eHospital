import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice, InvoiceItem, InvoiceService, CreateInvoiceRequest, UpdateInvoiceRequest, CreateInvoiceItemRequest, CreatePaymentRequest } from './services/invoice.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ExportService } from '../../core/services/export.service';
import { PatientService } from '../patients/services/patient.service';
import { Patient } from '../patients/models/patient.model';
import { AppointmentService } from '../appointments/services/appointment.service';
import { Appointment } from '../appointments/models/appointment.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSkeletonComponent],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.scss']
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  paginatedInvoices: Invoice[] = [];
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  isLoading = false;
  searchTerm = '';
  patientFilter: number | null = null;
  statusFilter: string = '';
  showModal = false;
  showDetailModal = false;
  showPaymentModal = false;
  selectedInvoice: Invoice | null = null;
  invoiceForm: FormGroup;
  paymentForm: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  invoiceStatuses = ['Pending', 'PartiallyPaid', 'Paid', 'Overdue', 'Cancelled'];
  paymentMethods = ['Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'Check', 'Insurance'];
  itemTypes = ['Appointment', 'LabTest', 'Medication', 'Procedure', 'Other'];

  constructor(
    private invoiceService: InvoiceService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private exportService: ExportService
  ) {
    this.invoiceForm = this.fb.group({
      patientId: ['', Validators.required],
      appointmentId: [null],
      invoiceDate: [new Date().toISOString().slice(0, 10), Validators.required],
      dueDate: ['', Validators.required],
      taxAmount: [0, [Validators.min(0)]],
      discountAmount: [0, [Validators.min(0)]],
      notes: [''],
      invoiceItems: this.fb.array([])
    });

    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['', Validators.required],
      paymentDate: [new Date().toISOString().slice(0, 16), Validators.required],
      transactionReference: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadAppointments();
    this.loadInvoices();
  }

  get invoiceItems(): FormArray {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: () => {
        this.toastService.error('Failed to load patients');
      }
    });
  }

  loadAppointments() {
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
      },
      error: () => {
        // Silent fail - appointments are optional
      }
    });
  }

  loadInvoices() {
    this.isLoading = true;
    this.invoiceService.getAll().subscribe({
      next: (data) => {
        this.invoices = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Failed to load invoices');
      }
    });
  }

  applyFilters() {
    let temp = this.invoices;

    // Patient filter
    if (this.patientFilter) {
      temp = temp.filter(inv => inv.patientId === this.patientFilter);
    }

    // Status filter
    if (this.statusFilter) {
      temp = temp.filter(inv => inv.status === this.statusFilter);
    }

    // Search
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      temp = temp.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(term) ||
        inv.patientName?.toLowerCase().includes(term) ||
        inv.notes?.toLowerCase().includes(term)
      );
    }

    this.filteredInvoices = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInvoices = this.filteredInvoices.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.editingId = null;
    this.invoiceItems.clear();
    this.invoiceForm.reset({
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      taxAmount: 0,
      discountAmount: 0,
      patientId: this.patientFilter || '',
      appointmentId: null
    });
    this.addInvoiceItem();
    this.showModal = true;
  }

  openEditModal(invoice: Invoice) {
    this.isEditMode = true;
    this.editingId = invoice.id;
    this.invoiceItems.clear();
    
    invoice.invoiceItems.forEach(item => {
      this.addInvoiceItem(item);
    });

    this.invoiceForm.patchValue({
      patientId: invoice.patientId,
      appointmentId: invoice.appointmentId || null,
      invoiceDate: new Date(invoice.invoiceDate).toISOString().slice(0, 10),
      dueDate: new Date(invoice.dueDate).toISOString().slice(0, 10),
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      notes: invoice.notes || ''
    });
    this.showModal = true;
  }

  openDetailModal(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showDetailModal = true;
  }

  openPaymentModal(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.paymentForm.reset({
      amount: Math.max(0, invoice.balanceAmount),
      paymentMethod: '',
      paymentDate: new Date().toISOString().slice(0, 16),
      transactionReference: '',
      notes: ''
    });
    this.showPaymentModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.invoiceForm.reset();
    this.invoiceItems.clear();
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedInvoice = null;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentForm.reset();
  }

  addInvoiceItem(item?: { description?: string; quantity?: number; unitPrice?: number; itemType?: string; relatedEntityId?: number }) {
    const itemForm = this.fb.group({
      description: [item?.description || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      itemType: [item?.itemType || ''],
      relatedEntityId: [item?.relatedEntityId || null]
    });
    this.invoiceItems.push(itemForm);
  }

  removeInvoiceItem(index: number) {
    this.invoiceItems.removeAt(index);
  }

  calculateSubTotal(): number {
    return this.invoiceItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  }

  calculateTotal(): number {
    const subTotal = this.calculateSubTotal();
    const taxAmount = this.invoiceForm.get('taxAmount')?.value || 0;
    const discountAmount = this.invoiceForm.get('discountAmount')?.value || 0;
    return subTotal + taxAmount - discountAmount;
  }

  submitInvoice() {
    if (this.invoiceForm.invalid || this.invoiceItems.length === 0) {
      this.markFormGroupTouched(this.invoiceForm);
      if (this.invoiceItems.length === 0) {
        this.toastService.error('Please add at least one invoice item');
      } else {
        this.toastService.error('Please correct the form errors');
      }
      return;
    }

    const formValue = this.invoiceForm.value;
    const invoiceItems: CreateInvoiceItemRequest[] = this.invoiceItems.controls.map(control => ({
      description: control.get('description')?.value,
      quantity: control.get('quantity')?.value,
      unitPrice: control.get('unitPrice')?.value,
      itemType: control.get('itemType')?.value || undefined,
      relatedEntityId: control.get('relatedEntityId')?.value || undefined
    }));

    if (this.isEditMode && this.editingId) {
      const payload: UpdateInvoiceRequest = {
        dueDate: new Date(formValue.dueDate).toISOString(),
        taxAmount: formValue.taxAmount || 0,
        discountAmount: formValue.discountAmount || 0,
        notes: formValue.notes || undefined
      };
      
      this.invoiceService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toastService.success('Invoice updated successfully');
          this.closeModal();
          this.loadInvoices();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update invoice');
        }
      });
    } else {
      const payload: CreateInvoiceRequest = {
        patientId: formValue.patientId,
        appointmentId: formValue.appointmentId || undefined,
        invoiceDate: new Date(formValue.invoiceDate).toISOString(),
        dueDate: new Date(formValue.dueDate).toISOString(),
        taxAmount: formValue.taxAmount || 0,
        discountAmount: formValue.discountAmount || 0,
        notes: formValue.notes || undefined,
        invoiceItems: invoiceItems
      };
      
      this.invoiceService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Invoice created successfully');
          this.closeModal();
          this.loadInvoices();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create invoice');
        }
      });
    }
  }

  submitPayment() {
    if (this.paymentForm.invalid || !this.selectedInvoice) {
      this.markFormGroupTouched(this.paymentForm);
      this.toastService.error('Please correct the form errors');
      return;
    }

    const formValue = this.paymentForm.value;
    const payload: CreatePaymentRequest = {
      invoiceId: this.selectedInvoice.id,
      amount: formValue.amount,
      paymentMethod: formValue.paymentMethod,
      paymentDate: new Date(formValue.paymentDate).toISOString(),
      transactionReference: formValue.transactionReference || undefined,
      notes: formValue.notes || undefined
    };

    this.invoiceService.createPayment(payload).subscribe({
      next: () => {
        this.toastService.success('Payment recorded successfully');
        this.closePaymentModal();
        this.loadInvoices();
        if (this.selectedInvoice) {
          this.invoiceService.getById(this.selectedInvoice.id).subscribe({
            next: (updatedInvoice) => {
              this.selectedInvoice = updatedInvoice;
            }
          });
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to record payment');
      }
    });
  }

  deleteInvoice(invoice: Invoice) {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }
    this.invoiceService.delete(invoice.id).subscribe({
      next: () => {
        this.toastService.success('Invoice deleted successfully');
        this.loadInvoices();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete invoice');
      }
    });
  }

  downloadPdf(invoice: Invoice) {
    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Invoice PDF downloaded successfully');
      },
      error: () => {
        this.toastService.error('Failed to download invoice PDF');
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pending': 'status-pending',
      'PartiallyPaid': 'status-partial',
      'Paid': 'status-paid',
      'Overdue': 'status-overdue',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  exportToCSV() {
    if (this.filteredInvoices.length === 0) {
      this.toastService.warning('No invoices to export');
      return;
    }

    const headers = ['Invoice Number', 'Patient', 'Date', 'Due Date', 'Total', 'Paid', 'Balance', 'Status'];
    const data = this.filteredInvoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Patient': inv.patientName || `Patient #${inv.patientId}`,
      'Date': new Date(inv.invoiceDate).toLocaleDateString(),
      'Due Date': new Date(inv.dueDate).toLocaleDateString(),
      'Total': inv.totalAmount,
      'Paid': inv.paidAmount,
      'Balance': inv.balanceAmount,
      'Status': inv.status
    }));

    this.exportService.exportToCSV(data, 'invoices', headers);
    this.toastService.success('Invoices exported to CSV successfully');
  }

  exportToPDF() {
    if (this.filteredInvoices.length === 0) {
      this.toastService.warning('No invoices to export');
      return;
    }

    const headers = ['Invoice Number', 'Patient', 'Date', 'Total', 'Paid', 'Balance', 'Status'];
    const data = this.filteredInvoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Patient': inv.patientName || `Patient #${inv.patientId}`,
      'Date': new Date(inv.invoiceDate).toLocaleDateString(),
      'Total': inv.totalAmount,
      'Paid': inv.paidAmount,
      'Balance': inv.balanceAmount,
      'Status': inv.status
    }));

    this.exportService.exportToPDF(data, 'invoices', headers, 'Invoices Report');
    this.toastService.success('Invoices exported to PDF successfully');
  }
}

