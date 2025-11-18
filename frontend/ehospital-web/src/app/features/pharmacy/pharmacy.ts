import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { SupplierService } from './services/supplier.service';
import { InventoryItemService } from './services/inventory-item.service';
import { PurchaseOrderService } from './services/purchase-order.service';
import { StockMovementService } from './services/stock-movement.service';
import { MedicationService, Medication } from '../medications/services/medication.service';
import {
  Supplier, InventoryItem, PurchaseOrder, StockMovement, LowStockAlert, ExpiringItems,
  CreateSupplierRequest, UpdateSupplierRequest,
  CreateInventoryItemRequest, UpdateInventoryItemRequest,
  CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, ReceivePurchaseOrderRequest,
  CreateStockMovementRequest, AdjustStockRequest
} from './models/inventory.model';

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pharmacy.html',
  styleUrls: ['./pharmacy.scss']
})
export class PharmacyComponent implements OnInit {
  activeTab: 'dashboard' | 'suppliers' | 'inventory' | 'purchaseOrders' | 'stockMovements' = 'dashboard';

  // Suppliers
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];

  // Inventory Items
  inventoryItems: InventoryItem[] = [];
  filteredInventoryItems: InventoryItem[] = [];
  lowStockAlerts: LowStockAlert[] = [];
  expiringItems: ExpiringItems[] = [];

  // Purchase Orders
  purchaseOrders: PurchaseOrder[] = [];
  filteredPurchaseOrders: PurchaseOrder[] = [];

  // Stock Movements
  stockMovements: StockMovement[] = [];
  filteredStockMovements: StockMovement[] = [];

  // Medications
  medications: Medication[] = [];

  isLoading = false;
  searchTerm = '';
  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;
  modalType: 'supplier' | 'inventory' | 'purchaseOrder' | 'receiveOrder' | 'stockMovement' | 'adjustStock' | null = null;

  // Forms
  supplierForm: FormGroup;
  inventoryItemForm: FormGroup;
  purchaseOrderForm: FormGroup;
  receiveOrderForm: FormGroup;
  stockMovementForm: FormGroup;
  adjustStockForm: FormGroup;

  // Filters
  statusFilter = '';
  categoryFilter = '';
  supplierFilter: number | null = null;
  movementTypeFilter = '';

  // Selected for operations
  selectedPurchaseOrder: PurchaseOrder | null = null;
  selectedInventoryItem: InventoryItem | null = null;

  // Categories
  categories = ['Medication', 'Medical Supplies', 'Equipment', 'Consumables', 'Other'];

  constructor(
    private supplierService: SupplierService,
    private inventoryItemService: InventoryItemService,
    private purchaseOrderService: PurchaseOrderService,
    private stockMovementService: StockMovementService,
    private medicationService: MedicationService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      contactPerson: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      taxId: [''],
      notes: [''],
      isActive: [true]
    });

    this.inventoryItemForm = this.fb.group({
      itemCode: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      unit: ['', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0],
      currentStock: [0],
      minimumStockLevel: [0],
      maximumStockLevel: [0],
      reorderQuantity: [0],
      expiryDate: [''],
      batchNumber: [''],
      manufacturer: [''],
      storageLocation: [''],
      requiresPrescription: [false],
      isActive: [true],
      medicationId: [null],
      supplierId: [null]
    });

    this.purchaseOrderForm = this.fb.group({
      supplierId: ['', Validators.required],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      expectedDeliveryDate: [''],
      notes: [''],
      items: this.fb.array([])
    });

    this.receiveOrderForm = this.fb.group({
      receivedDate: [new Date().toISOString().split('T')[0], Validators.required],
      receivedByUserId: ['', Validators.required],
      items: this.fb.array([])
    });

    this.stockMovementForm = this.fb.group({
      inventoryItemId: ['', Validators.required],
      movementType: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0],
      reason: ['', Validators.required],
      referenceNumber: [''],
      batchNumber: [''],
      expiryDate: [''],
      notes: [''],
      movementDate: [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.adjustStockForm = this.fb.group({
      quantity: [0, Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadInventoryItems();
    this.loadPurchaseOrders();
    this.loadStockMovements();
    this.loadMedications();
    this.loadAlerts();
  }

  // Load data
  loadSuppliers() {
    this.isLoading = true;
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load suppliers');
        this.isLoading = false;
      }
    });
  }

  loadInventoryItems() {
    this.isLoading = true;
    this.inventoryItemService.getAll().subscribe({
      next: (data) => {
        this.inventoryItems = data;
        this.filteredInventoryItems = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load inventory items');
        this.isLoading = false;
      }
    });
  }

  loadPurchaseOrders() {
    this.isLoading = true;
    this.purchaseOrderService.getAll().subscribe({
      next: (data) => {
        this.purchaseOrders = data;
        this.filteredPurchaseOrders = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load purchase orders');
        this.isLoading = false;
      }
    });
  }

  loadStockMovements() {
    this.isLoading = true;
    this.stockMovementService.getAll().subscribe({
      next: (data) => {
        this.stockMovements = data;
        this.filteredStockMovements = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load stock movements');
        this.isLoading = false;
      }
    });
  }

  loadMedications() {
    this.medicationService.getAll().subscribe({
      next: (data) => {
        this.medications = data;
      },
      error: () => {
        this.toastService.error('Failed to load medications');
      }
    });
  }

  loadAlerts() {
    this.inventoryItemService.getLowStock().subscribe({
      next: (data) => {
        this.lowStockAlerts = data;
      },
      error: () => {
        this.toastService.error('Failed to load low stock alerts');
      }
    });

    this.inventoryItemService.getExpiring(30).subscribe({
      next: (data) => {
        this.expiringItems = data;
      },
      error: () => {
        this.toastService.error('Failed to load expiring items');
      }
    });
  }

  // Supplier CRUD
  openSupplierModal(supplier?: Supplier) {
    this.modalType = 'supplier';
    this.isEditMode = !!supplier;
    this.selectedId = supplier?.id || null;
    if (supplier) {
      this.supplierForm.patchValue(supplier);
    } else {
      this.supplierForm.reset({ isActive: true });
    }
    this.showModal = true;
  }

  saveSupplier() {
    if (this.supplierForm.invalid) return;

    const payload = this.supplierForm.value;
    if (this.isEditMode && this.selectedId) {
      this.supplierService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Supplier updated successfully');
          this.closeModal();
          this.loadSuppliers();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Update failed');
        }
      });
    } else {
      this.supplierService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Supplier created successfully');
          this.closeModal();
          this.loadSuppliers();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Create failed');
        }
      });
    }
  }

  deleteSupplier(id: number) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    this.supplierService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Supplier deleted successfully');
        this.loadSuppliers();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Delete failed');
      }
    });
  }

  // Inventory Item CRUD
  openInventoryItemModal(item?: InventoryItem) {
    this.modalType = 'inventory';
    this.isEditMode = !!item;
    this.selectedId = item?.id || null;
    if (item) {
      this.inventoryItemForm.patchValue({
        ...item,
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ''
      });
    } else {
      this.inventoryItemForm.reset({ isActive: true, currentStock: 0, minimumStockLevel: 0, maximumStockLevel: 0 });
    }
    this.showModal = true;
  }

  saveInventoryItem() {
    if (this.inventoryItemForm.invalid) return;

    const payload = this.inventoryItemForm.value;
    if (this.isEditMode && this.selectedId) {
      this.inventoryItemService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Inventory item updated successfully');
          this.closeModal();
          this.loadInventoryItems();
          this.loadAlerts();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Update failed');
        }
      });
    } else {
      this.inventoryItemService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Inventory item created successfully');
          this.closeModal();
          this.loadInventoryItems();
          this.loadAlerts();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Create failed');
        }
      });
    }
  }

  deleteInventoryItem(id: number) {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    this.inventoryItemService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Inventory item deleted successfully');
        this.loadInventoryItems();
        this.loadAlerts();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Delete failed');
      }
    });
  }

  openAdjustStockModal(item: InventoryItem) {
    this.modalType = 'adjustStock';
    this.selectedInventoryItem = item;
    this.adjustStockForm.reset({ quantity: 0 });
    this.showModal = true;
  }

  adjustStock() {
    if (this.adjustStockForm.invalid || !this.selectedInventoryItem) return;

    const payload = this.adjustStockForm.value;
    this.inventoryItemService.adjustStock(this.selectedInventoryItem.id, payload).subscribe({
      next: () => {
        this.toastService.success('Stock adjusted successfully');
        this.closeModal();
        this.loadInventoryItems();
        this.loadAlerts();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Stock adjustment failed');
      }
    });
  }

  // Purchase Order CRUD
  openPurchaseOrderModal(order?: PurchaseOrder) {
    this.modalType = 'purchaseOrder';
    this.isEditMode = !!order;
    this.selectedId = order?.id || null;
    if (order) {
      this.purchaseOrderForm.patchValue({
        ...order,
        orderDate: order.orderDate.split('T')[0],
        expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : ''
      });
      // Populate items array
      const itemsArray = this.purchaseOrderForm.get('items') as FormArray;
      itemsArray.clear();
      order.items.forEach(item => {
        itemsArray.push(this.fb.group({
          inventoryItemId: [item.inventoryItemId, Validators.required],
          quantity: [item.quantity, Validators.required],
          unitPrice: [item.unitPrice, Validators.required],
          discountPercent: [item.discountPercent || 0]
        }));
      });
    } else {
      this.purchaseOrderForm.reset({
        orderDate: new Date().toISOString().split('T')[0]
      });
      const itemsArray = this.purchaseOrderForm.get('items') as FormArray;
      itemsArray.clear();
      this.addPurchaseOrderItem();
    }
    this.showModal = true;
  }

  get purchaseOrderItems(): FormArray {
    return this.purchaseOrderForm.get('items') as FormArray;
  }

  addPurchaseOrderItem() {
    const itemsArray = this.purchaseOrderForm.get('items') as FormArray;
    itemsArray.push(this.fb.group({
      inventoryItemId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercent: [0]
    }));
  }

  removePurchaseOrderItem(index: number) {
    const itemsArray = this.purchaseOrderForm.get('items') as FormArray;
    itemsArray.removeAt(index);
  }

  savePurchaseOrder() {
    if (this.purchaseOrderForm.invalid) return;

    const payload = this.purchaseOrderForm.value;
    if (this.isEditMode && this.selectedId) {
      this.purchaseOrderService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Purchase order updated successfully');
          this.closeModal();
          this.loadPurchaseOrders();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Update failed');
        }
      });
    } else {
      this.purchaseOrderService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Purchase order created successfully');
          this.closeModal();
          this.loadPurchaseOrders();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Create failed');
        }
      });
    }
  }

  approvePurchaseOrder(id: number, userId: number) {
    this.purchaseOrderService.approve(id, userId).subscribe({
      next: () => {
        this.toastService.success('Purchase order approved successfully');
        this.loadPurchaseOrders();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Approval failed');
      }
    });
  }

  openReceiveOrderModal(order: PurchaseOrder) {
    this.modalType = 'receiveOrder';
    this.selectedPurchaseOrder = order;
    this.receiveOrderForm.reset({
      receivedDate: new Date().toISOString().split('T')[0]
    });
    const itemsArray = this.receiveOrderForm.get('items') as FormArray;
    itemsArray.clear();
    order.items.forEach(item => {
      itemsArray.push(this.fb.group({
        purchaseOrderItemId: [item.id],
        receivedQuantity: [item.quantity, [Validators.required, Validators.min(0), Validators.max(item.quantity)]],
        expiryDate: [''],
        batchNumber: ['']
      }));
    });
    this.showModal = true;
  }

  get receiveOrderItems(): FormArray {
    return this.receiveOrderForm.get('items') as FormArray;
  }

  receivePurchaseOrder() {
    if (this.receiveOrderForm.invalid || !this.selectedPurchaseOrder) return;

    const payload = this.receiveOrderForm.value;
    this.purchaseOrderService.receive(this.selectedPurchaseOrder.id, payload).subscribe({
      next: () => {
        this.toastService.success('Purchase order received successfully');
        this.closeModal();
        this.loadPurchaseOrders();
        this.loadInventoryItems();
        this.loadAlerts();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Receive failed');
      }
    });
  }

  cancelPurchaseOrder(id: number) {
    if (!confirm('Are you sure you want to cancel this purchase order?')) return;

    this.purchaseOrderService.cancel(id).subscribe({
      next: () => {
        this.toastService.success('Purchase order cancelled successfully');
        this.loadPurchaseOrders();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Cancel failed');
      }
    });
  }

  // Stock Movement
  openStockMovementModal(item?: InventoryItem) {
    this.modalType = 'stockMovement';
    this.selectedInventoryItem = item || null;
    if (item) {
      this.stockMovementForm.patchValue({
        inventoryItemId: item.id,
        unitPrice: item.unitPrice
      });
    }
    this.stockMovementForm.reset({
      movementDate: new Date().toISOString().split('T')[0],
      inventoryItemId: item?.id || '',
      movementType: 'Out',
      quantity: 1
    });
    this.showModal = true;
  }

  saveStockMovement() {
    if (this.stockMovementForm.invalid) return;

    const payload = this.stockMovementForm.value;
    this.stockMovementService.create(payload).subscribe({
      next: () => {
        this.toastService.success('Stock movement recorded successfully');
        this.closeModal();
        this.loadStockMovements();
        this.loadInventoryItems();
        this.loadAlerts();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Stock movement failed');
      }
    });
  }

  // Utility
  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedId = null;
    this.selectedPurchaseOrder = null;
    this.selectedInventoryItem = null;
    this.modalType = null;
    this.supplierForm.reset();
    this.inventoryItemForm.reset();
    this.purchaseOrderForm.reset();
    this.receiveOrderForm.reset();
    this.stockMovementForm.reset();
    this.adjustStockForm.reset();
  }

  applyFilters() {
    // Filter inventory items
    let filtered = [...this.inventoryItems];
    if (this.statusFilter) {
      filtered = filtered.filter(i => i.stockStatus === this.statusFilter);
    }
    if (this.categoryFilter) {
      filtered = filtered.filter(i => i.category === this.categoryFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.itemCode.toLowerCase().includes(term) ||
        i.description?.toLowerCase().includes(term)
      );
    }
    this.filteredInventoryItems = filtered;

    // Filter purchase orders
    let filteredOrders = [...this.purchaseOrders];
    if (this.statusFilter) {
      filteredOrders = filteredOrders.filter(po => po.status === this.statusFilter);
    }
    if (this.supplierFilter) {
      filteredOrders = filteredOrders.filter(po => po.supplierId === this.supplierFilter);
    }
    this.filteredPurchaseOrders = filteredOrders;

    // Filter stock movements
    let filteredMovements = [...this.stockMovements];
    if (this.movementTypeFilter) {
      filteredMovements = filteredMovements.filter(sm => sm.movementType === this.movementTypeFilter);
    }
    this.filteredStockMovements = filteredMovements;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Ordered': 'status-ordered',
      'Received': 'status-received',
      'Partially Received': 'status-partial',
      'Cancelled': 'status-cancelled',
      'InStock': 'status-available',
      'LowStock': 'status-warning',
      'OutOfStock': 'status-error',
      'Expired': 'status-error'
    };
    return statusMap[status] || 'status-default';
  }

  getMovementTypeClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'In': 'movement-in',
      'Out': 'movement-out',
      'Adjustment': 'movement-adjustment',
      'Return': 'movement-return',
      'Transfer': 'movement-transfer'
    };
    return typeMap[type] || 'movement-default';
  }

  calculateLineTotal(item: any): number {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discountPercent || 0;
    return quantity * unitPrice * (1 - discount / 100);
  }

  onInventoryItemChange(index: number) {
    const itemsArray = this.purchaseOrderForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(index);
    const inventoryItemId = itemGroup.get('inventoryItemId')?.value;
    if (inventoryItemId) {
      const item = this.inventoryItems.find(i => i.id === inventoryItemId);
      if (item) {
        itemGroup.patchValue({ unitPrice: item.unitPrice });
      }
    }
  }

  // Getter methods for template
  getOutOfStockCount(): number {
    return this.inventoryItems.filter(i => i.stockStatus === 'OutOfStock').length;
  }

  getPendingOrdersCount(): number {
    return this.purchaseOrders.filter(po => po.status === 'Pending').length;
  }

  getActiveSuppliers(): Supplier[] {
    return this.suppliers.filter(s => s.isActive);
  }

  getActiveInventoryItems(): InventoryItem[] {
    return this.inventoryItems.filter(i => i.isActive);
  }

  filterSuppliers() {
    if (!this.searchTerm) {
      this.filteredSuppliers = this.suppliers;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.email.toLowerCase().includes(term)
    );
  }

  getPurchaseOrderItemName(index: number): string {
    if (!this.selectedPurchaseOrder || !this.selectedPurchaseOrder.items[index]) {
      return '';
    }
    return this.selectedPurchaseOrder.items[index].inventoryItemName || '';
  }

  getPurchaseOrderItemQuantity(index: number): number {
    if (!this.selectedPurchaseOrder || !this.selectedPurchaseOrder.items[index]) {
      return 0;
    }
    return this.selectedPurchaseOrder.items[index].quantity;
  }
}

