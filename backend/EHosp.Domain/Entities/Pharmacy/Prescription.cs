namespace EHosp.Domain.Entities;
public class Prescription
{
    public int Id { get; set; }
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public int Duration { get; set; } // in days
    public string Instructions { get; set; } = string.Empty;
    public DateTime PrescribedDate { get; set; } = DateTime.UtcNow;

    // Prescription processing workflow
    public string Status { get; set; } = "Pending"; // Pending, Verified, Dispensed, Completed, Cancelled
    public int? VerifiedByUserId { get; set; }
    public int? DispensedByUserId { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? DispensedAt { get; set; }
    public bool AllergyChecked { get; set; } = false;
    public bool InteractionChecked { get; set; } = false;
    public string? PharmacistNotes { get; set; }
    public string? AllergyAlert { get; set; }
    public string? InteractionAlert { get; set; }

    // Foreign keys
    public int MedicalRecordId { get; set; }
    public int MedicationId { get; set; }
    public int DoctorId { get; set; }

    // Navigation properties
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public Medication Medication { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public User? VerifiedByUser { get; set; }
    public User? DispensedByUser { get; set; }
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}