namespace EHosp.Domain.Entities;

public class ClaimPayment
{
    public int Id { get; set; }
    public string PaymentReference { get; set; } = string.Empty; // Payment reference from insurance
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string? CheckNumber { get; set; }
    public string? EFTReference { get; set; } // Electronic funds transfer reference
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? PostedByUserId { get; set; }

    // Foreign key
    public int ClaimId { get; set; }

    // Navigation properties
    public Claim Claim { get; set; } = null!;
    public User? PostedByUser { get; set; }
}

