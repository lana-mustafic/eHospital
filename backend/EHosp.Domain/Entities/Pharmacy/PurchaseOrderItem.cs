namespace EHosp.Domain.Entities;

public class PurchaseOrderItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercent { get; set; } = 0;
    public decimal LineTotal { get; set; }
    public int? ReceivedQuantity { get; set; } // For partial receipts
    public DateTime? ExpiryDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Notes { get; set; }

    // Foreign keys
    public int PurchaseOrderId { get; set; }
    public int InventoryItemId { get; set; }

    // Navigation properties
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public InventoryItem InventoryItem { get; set; } = null!;
}

