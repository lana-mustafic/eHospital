export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  totalOrders: number;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  notes?: string;
  isActive?: boolean;
}

export interface InventoryItem {
  id: number;
  itemCode: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  unitPrice: number;
  sellingPrice?: number;
  currentStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderQuantity?: number;
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  storageLocation?: string;
  requiresPrescription: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  medicationId?: number;
  medicationName?: string;
  supplierId?: number;
  supplierName?: string;
  stockStatus: string;
  isLowStock: boolean;
  isExpired: boolean;
}

export interface CreateInventoryItemRequest {
  itemCode: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  sellingPrice?: number;
  currentStock?: number;
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  reorderQuantity?: number;
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  storageLocation?: string;
  requiresPrescription?: boolean;
  isActive?: boolean;
  medicationId?: number;
  supplierId?: number;
}

export interface UpdateInventoryItemRequest {
  itemCode?: string;
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  unitPrice?: number;
  sellingPrice?: number;
  currentStock?: number;
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  reorderQuantity?: number;
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  storageLocation?: string;
  requiresPrescription?: boolean;
  isActive?: boolean;
  medicationId?: number;
  supplierId?: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  status: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  supplierId: number;
  supplierName?: string;
  createdByUserId?: number;
  createdByUserName?: string;
  approvedByUserId?: number;
  approvedByUserName?: string;
  receivedByUserId?: number;
  receivedByUserName?: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  lineTotal: number;
  receivedQuantity?: number;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
  purchaseOrderId: number;
  inventoryItemId: number;
  inventoryItemName?: string;
  inventoryItemCode?: string;
}

export interface CreatePurchaseOrderRequest {
  orderDate?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  supplierId: number;
  createdByUserId?: number;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  inventoryItemId: number;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface UpdatePurchaseOrderRequest {
  expectedDeliveryDate?: string;
  status?: string;
  notes?: string;
  approvedByUserId?: number;
  receivedByUserId?: number;
  receivedDate?: string;
}

export interface ReceivePurchaseOrderRequest {
  receivedDate?: string;
  receivedByUserId: number;
  items: ReceivePurchaseOrderItemRequest[];
}

export interface ReceivePurchaseOrderItemRequest {
  purchaseOrderItemId: number;
  receivedQuantity: number;
  expiryDate?: string;
  batchNumber?: string;
}

export interface StockMovement {
  id: number;
  movementType: string;
  quantity: number;
  unitPrice?: number;
  reason: string;
  referenceNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  movementDate: string;
  createdAt: string;
  inventoryItemId: number;
  inventoryItemName?: string;
  inventoryItemCode?: string;
  createdByUserId?: number;
  createdByUserName?: string;
  prescriptionId?: number;
}

export interface CreateStockMovementRequest {
  movementType: string;
  quantity: number;
  unitPrice?: number;
  reason: string;
  referenceNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  movementDate?: string;
  inventoryItemId: number;
  createdByUserId?: number;
  prescriptionId?: number;
}

export interface LowStockAlert {
  inventoryItemId: number;
  itemCode: string;
  name: string;
  currentStock: number;
  minimumStockLevel: number;
  reorderQuantity?: number;
  supplierName?: string;
  category: string;
}

export interface ExpiringItems {
  inventoryItemId: number;
  itemCode: string;
  name: string;
  currentStock: number;
  expiryDate: string;
  daysUntilExpiry: number;
  category: string;
}

export interface AdjustStockRequest {
  quantity: number;
  reason: string;
  userId?: number;
}

