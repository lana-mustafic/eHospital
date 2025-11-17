namespace EHosp.Domain.Entities;

public class PatientAllergy
{
    public int Id { get; set; }
    public string AllergenName { get; set; } = string.Empty;
    public string AllergyType { get; set; } = string.Empty; // Food, Medication, Environmental, Other
    public string Severity { get; set; } = string.Empty; // Mild, Moderate, Severe, Life-threatening
    public string? Reaction { get; set; }
    public DateTime? OnsetDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int? RecordedByUserId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public User? RecordedByUser { get; set; }
}

