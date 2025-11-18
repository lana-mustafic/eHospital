namespace EHosp.Application.DTOs;

public class SupplierDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int TotalOrders { get; set; }
}

public class CreateSupplierDto
{
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateSupplierDto
{
    public string? Name { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? TaxId { get; set; }
    public string? Notes { get; set; }
    public bool? IsActive { get; set; }
}

public class InventoryItemDto
{
    public int Id { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal? SellingPrice { get; set; }
    public int CurrentStock { get; set; }
    public int MinimumStockLevel { get; set; }
    public int MaximumStockLevel { get; set; }
    public int? ReorderQuantity { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? StorageLocation { get; set; }
    public bool RequiresPrescription { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? MedicationId { get; set; }
    public string? MedicationName { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public string StockStatus { get; set; } = string.Empty; // InStock, LowStock, OutOfStock, Expired
    public bool IsLowStock { get; set; }
    public bool IsExpired { get; set; }
}

public class CreateInventoryItemDto
{
    public string ItemCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal? SellingPrice { get; set; }
    public int CurrentStock { get; set; } = 0;
    public int MinimumStockLevel { get; set; } = 0;
    public int MaximumStockLevel { get; set; } = 0;
    public int? ReorderQuantity { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? StorageLocation { get; set; }
    public bool RequiresPrescription { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public int? MedicationId { get; set; }
    public int? SupplierId { get; set; }
}

public class UpdateInventoryItemDto
{
    public string? ItemCode { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Unit { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? SellingPrice { get; set; }
    public int? CurrentStock { get; set; }
    public int? MinimumStockLevel { get; set; }
    public int? MaximumStockLevel { get; set; }
    public int? ReorderQuantity { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? StorageLocation { get; set; }
    public bool? RequiresPrescription { get; set; }
    public bool? IsActive { get; set; }
    public int? MedicationId { get; set; }
    public int? SupplierId { get; set; }
}

public class PurchaseOrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public int? ReceivedByUserId { get; set; }
    public string? ReceivedByUserName { get; set; }
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class PurchaseOrderItemDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercent { get; set; }
    public decimal LineTotal { get; set; }
    public int? ReceivedQuantity { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Notes { get; set; }
    public int PurchaseOrderId { get; set; }
    public int InventoryItemId { get; set; }
    public string? InventoryItemName { get; set; }
    public string? InventoryItemCode { get; set; }
}

public class CreatePurchaseOrderDto
{
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? Notes { get; set; }
    public int SupplierId { get; set; }
    public int? CreatedByUserId { get; set; }
    public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
}

public class CreatePurchaseOrderItemDto
{
    public int InventoryItemId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercent { get; set; } = 0;
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Notes { get; set; }
}

public class UpdatePurchaseOrderDto
{
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public int? ApprovedByUserId { get; set; }
    public int? ReceivedByUserId { get; set; }
    public DateTime? ReceivedDate { get; set; }
}

public class ReceivePurchaseOrderDto
{
    public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
    public int ReceivedByUserId { get; set; }
    public List<ReceivePurchaseOrderItemDto> Items { get; set; } = new();
}

public class ReceivePurchaseOrderItemDto
{
    public int PurchaseOrderItemId { get; set; }
    public int ReceivedQuantity { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
}

public class StockMovementDto
{
    public int Id { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
    public DateTime MovementDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int InventoryItemId { get; set; }
    public string? InventoryItemName { get; set; }
    public string? InventoryItemCode { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    public int? PrescriptionId { get; set; }
}

public class CreateStockMovementDto
{
    public string MovementType { get; set; } = string.Empty; // In, Out, Adjustment, Return, Transfer
    public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    public int InventoryItemId { get; set; }
    public int? CreatedByUserId { get; set; }
    public int? PrescriptionId { get; set; }
}

public class LowStockAlertDto
{
    public int InventoryItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinimumStockLevel { get; set; }
    public int? ReorderQuantity { get; set; }
    public string? SupplierName { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class ExpiringItemsDto
{
    public int InventoryItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int DaysUntilExpiry { get; set; }
    public string Category { get; set; } = string.Empty;
}

