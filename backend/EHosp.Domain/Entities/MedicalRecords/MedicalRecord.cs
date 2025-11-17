namespace EHosp.Domain.Entities;
public class MedicalRecord
{
    public int Id { get; set; }
    public DateTime VisitDate { get; set; }
    public string Symptoms { get; set; } = string.Empty;
    public string Treatment { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int? DiagnosisId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Diagnosis? Diagnosis { get; set; }
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<VitalSigns> VitalSigns { get; set; } = new List<VitalSigns>();
    public ICollection<LabTest> LabTests { get; set; } = new List<LabTest>();
    public ICollection<DischargeSummary> DischargeSummaries { get; set; } = new List<DischargeSummary>();
}