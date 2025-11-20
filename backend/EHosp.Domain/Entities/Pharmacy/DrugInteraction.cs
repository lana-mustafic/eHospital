namespace EHosp.Domain.Entities;

public class DrugInteraction
{
    public int Id { get; set; }
    public int Medication1Id { get; set; }
    public int Medication2Id { get; set; }
    public string Severity { get; set; } = string.Empty; // Minor, Moderate, Major, Contraindicated
    public string Description { get; set; } = string.Empty;
    public string ClinicalSignificance { get; set; } = string.Empty;
    public string Management { get; set; } = string.Empty; // Recommendations for managing the interaction
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Medication Medication1 { get; set; } = null!;
    public Medication Medication2 { get; set; } = null!;
}

