namespace EHosp.Domain.Entities;
public class Prescription
{
    public int Id { get; set; }
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public int Duration { get; set; } // in days
    public string Instructions { get; set; } = string.Empty;
    public DateTime PrescribedDate { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int MedicalRecordId { get; set; }
    public int MedicationId { get; set; }
    public int DoctorId { get; set; }

    // Navigation properties
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public Medication Medication { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}