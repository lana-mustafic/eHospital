namespace EHosp.Domain.Entities;

public class ClaimDenial
{
    public int Id { get; set; }
    public string DenialCode { get; set; } = string.Empty; // Denial reason code
    public string DenialReason { get; set; } = string.Empty; // Human-readable denial reason
    public string? AdjustmentCode { get; set; } // Adjustment reason code
    public decimal DeniedAmount { get; set; }
    public DateTime DenialDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Appealed, Resolved, WrittenOff
    public string? AppealNotes { get; set; }
    public DateTime? AppealDate { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public int? ResolvedByUserId { get; set; }

    // Foreign key
    public int ClaimId { get; set; }

    // Navigation properties
    public Claim Claim { get; set; } = null!;
    public User? ResolvedByUser { get; set; }
}

