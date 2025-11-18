namespace EHosp.Domain.Entities;

public class RoomTransfer
{
    public int Id { get; set; }
    public DateTime TransferDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedByUserId { get; set; }

    // Foreign keys
    public int AdmissionId { get; set; }
    public int FromRoomId { get; set; }
    public int ToRoomId { get; set; }
    public int FromBedId { get; set; }
    public int ToBedId { get; set; }
    public int? TransferredByDoctorId { get; set; }

    // Navigation properties
    public Admission Admission { get; set; } = null!;
    public Room FromRoom { get; set; } = null!;
    public Room ToRoom { get; set; } = null!;
    public Bed FromBed { get; set; } = null!;
    public Bed ToBed { get; set; } = null!;
    public Doctor? TransferredByDoctor { get; set; }
    public User? CreatedBy { get; set; }
}

