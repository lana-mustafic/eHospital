using EHosp.Domain.Entities;

namespace EHosp.Domain.Entities;

public class Doctor
{
    public int Id { get; set; }
    public string Specialization { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public int DepartmentId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Department Department { get; set; } = null!;
    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public virtual ICollection<DoctorSchedule> Schedules { get; set; } = new List<DoctorSchedule>();
    public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    public virtual ICollection<LabTest> LabTests { get; set; } = new List<LabTest>();
}