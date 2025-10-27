namespace EHosp.Domain.Entities;
public class Diagnosis
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // ICD-10 code
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
}