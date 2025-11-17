namespace EHosp.Domain.Entities;
public class Patient
{
    public int Id { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string EmergencyContact { get; set; } = string.Empty;
    public string BloodType { get; set; } = string.Empty;

    // Foreign keys
    public int UserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    public ICollection<VitalSigns> VitalSigns { get; set; } = new List<VitalSigns>();
    public ICollection<LabTest> LabTests { get; set; } = new List<LabTest>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<PatientAllergy> Allergies { get; set; } = new List<PatientAllergy>();
    public ICollection<ChronicCondition> ChronicConditions { get; set; } = new List<ChronicCondition>();
    public ICollection<FamilyMedicalHistory> FamilyMedicalHistories { get; set; } = new List<FamilyMedicalHistory>();
}