namespace EHosp.Domain.Entities;

public class PurchaseOrder
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty; // Auto-generated PO number
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Ordered, Received, Cancelled
    public decimal TotalAmount { get; set; } = 0;
    public decimal? DiscountAmount { get; set; } = 0;
    public decimal? TaxAmount { get; set; } = 0;
    public decimal GrandTotal { get; set; } = 0;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int SupplierId { get; set; }
    public int? CreatedByUserId { get; set; }
    public int? ApprovedByUserId { get; set; }
    public int? ReceivedByUserId { get; set; }

    // Navigation properties
    public Supplier Supplier { get; set; } = null!;
    public User? CreatedBy { get; set; }
    public User? ApprovedBy { get; set; }
    public User? ReceivedBy { get; set; }
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}

