namespace EHosp.Domain.Entities;

public class PatientInsurance
{
    public int Id { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string? GroupNumber { get; set; }
    public string? SubscriberId { get; set; } // Subscriber's member ID
    public string? SubscriberName { get; set; } // Name of policy holder (if different from patient)
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? CopayAmount { get; set; } // Copay information
    public string? Deductible { get; set; } // Deductible information
    public string? Coinsurance { get; set; } // Coinsurance percentage
    public string? CoverageType { get; set; } // Primary, Secondary, Tertiary
    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; } = false;
    public DateTime? VerifiedAt { get; set; }
    public int? VerifiedByUserId { get; set; }
    public string? VerificationNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int InsuranceProviderId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public InsuranceProvider InsuranceProvider { get; set; } = null!;
    public User? VerifiedByUser { get; set; }
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
    public ICollection<PriorAuthorization> PriorAuthorizations { get; set; } = new List<PriorAuthorization>();
}

