namespace EHosp.Domain.Entities;

public class FamilyMedicalHistory
{
    public int Id { get; set; }
    public string Relationship { get; set; } = string.Empty; // Father, Mother, Sibling, Grandparent, etc.
    public string ConditionName { get; set; } = string.Empty;
    public string? Category { get; set; } // Cardiovascular, Cancer, Diabetes, Mental Health, etc.
    public string? AgeOfOnset { get; set; }
    public string? Status { get; set; } // Alive, Deceased, Unknown
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int? RecordedByUserId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public User? RecordedByUser { get; set; }
}

