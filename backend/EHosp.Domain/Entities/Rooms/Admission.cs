namespace EHosp.Domain.Entities;

public class Admission
{
    public int Id { get; set; }
    public DateTime AdmissionDate { get; set; }
    public DateTime? DischargeDate { get; set; }
    public string Status { get; set; } = "Admitted"; // Admitted, Discharged, Transferred
    public string ReasonForAdmission { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int RoomId { get; set; }
    public int BedId { get; set; }
    public int? AdmittingDoctorId { get; set; }
    public int? DischargingDoctorId { get; set; }
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public Room Room { get; set; } = null!;
    public Bed Bed { get; set; } = null!;
    public Doctor? AdmittingDoctor { get; set; }
    public Doctor? DischargingDoctor { get; set; }
    public User? CreatedBy { get; set; }
    public ICollection<RoomTransfer> RoomTransfers { get; set; } = new List<RoomTransfer>();
}

