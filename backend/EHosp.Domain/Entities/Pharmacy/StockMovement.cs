namespace EHosp.Domain.Entities;

public class StockMovement
{
    public int Id { get; set; }
    public string MovementType { get; set; } = string.Empty; // In, Out, Adjustment, Return, Transfer
    public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public string Reason { get; set; } = string.Empty; // Purchase, Sale, Adjustment, Expired, Damaged, etc.
    public string? ReferenceNumber { get; set; } // PO Number, Invoice Number, etc.
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int InventoryItemId { get; set; }
    public int? CreatedByUserId { get; set; }
    public int? PrescriptionId { get; set; } // If movement is due to prescription fulfillment

    // Navigation properties
    public InventoryItem InventoryItem { get; set; } = null!;
    public User? CreatedBy { get; set; }
    public Prescription? Prescription { get; set; }
}

