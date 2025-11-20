namespace EHosp.Domain.Entities;

public class Claim
{
    public int Id { get; set; }
    public string ClaimNumber { get; set; } = string.Empty; // Unique claim number
    public string? ExternalClaimId { get; set; } // Claim ID from insurance provider
    public DateTime ServiceDate { get; set; }
    public DateTime? SubmissionDate { get; set; }
    public decimal TotalCharges { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public decimal? PatientResponsibility { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Submitted, Accepted, PartiallyPaid, Paid, Denied, Pending, UnderReview, Rejected
    public string? StatusReason { get; set; }
    public string? DiagnosisCodes { get; set; } // Comma-separated ICD-10 codes
    public string? ProcedureCodes { get; set; } // Comma-separated CPT codes
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public int? SubmittedByUserId { get; set; }

    // Foreign keys
    public int InvoiceId { get; set; }
    public int PatientInsuranceId { get; set; }

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public PatientInsurance PatientInsurance { get; set; } = null!;
    public User? SubmittedByUser { get; set; }
    public ICollection<ClaimDenial> Denials { get; set; } = new List<ClaimDenial>();
    public ICollection<ClaimPayment> Payments { get; set; } = new List<ClaimPayment>();
}

