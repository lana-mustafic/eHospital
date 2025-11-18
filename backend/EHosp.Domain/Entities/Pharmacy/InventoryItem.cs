namespace EHosp.Domain.Entities;

public class InventoryItem
{
    public int Id { get; set; }
    public string ItemCode { get; set; } = string.Empty; // SKU/Barcode
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Medication, Medical Supplies, Equipment, etc.
    public string Unit { get; set; } = string.Empty; // Each, Box, Bottle, Pack, etc.
    public decimal UnitPrice { get; set; }
    public decimal? SellingPrice { get; set; }
    public int CurrentStock { get; set; } = 0;
    public int MinimumStockLevel { get; set; } = 0; // Reorder point
    public int MaximumStockLevel { get; set; } = 0;
    public int? ReorderQuantity { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Manufacturer { get; set; }
    public string? StorageLocation { get; set; } // Shelf, Room, etc.
    public bool RequiresPrescription { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int? MedicationId { get; set; } // Link to existing Medication if applicable
    public int? SupplierId { get; set; } // Preferred supplier

    // Navigation properties
    public Medication? Medication { get; set; }
    public Supplier? Supplier { get; set; }
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
    public ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();
}

