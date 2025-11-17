namespace EHosp.Domain.Entities;

public class ChronicCondition
{
    public int Id { get; set; }
    public string ConditionName { get; set; } = string.Empty;
    public string? Category { get; set; } // Cardiovascular, Respiratory, Diabetes, etc.
    public DateTime? DiagnosisDate { get; set; }
    public string? Status { get; set; } // Active, Controlled, In Remission, Resolved
    public string? Treatment { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int? DiagnosedByDoctorId { get; set; }
    public int? RecordedByUserId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public Doctor? DiagnosedByDoctor { get; set; }
    public User? RecordedByUser { get; set; }
}

