namespace EHosp.Domain.Entities;

public class InsuranceProvider
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; } // Insurance provider code (e.g., BCBS, AETNA)
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? PayerId { get; set; } // Electronic payer ID for claims submission
    public string? ContactPerson { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<PatientInsurance> PatientInsurances { get; set; } = new List<PatientInsurance>();
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
    public ICollection<PriorAuthorization> PriorAuthorizations { get; set; } = new List<PriorAuthorization>();
}

