namespace EHosp.Domain.Entities;

public class Bed
{
    public int Id { get; set; }
    public string BedNumber { get; set; } = string.Empty; // e.g., "A", "B", "1", "2"
    public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance, Reserved
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int RoomId { get; set; }

    // Navigation properties
    public Room Room { get; set; } = null!;
    public ICollection<Admission> Admissions { get; set; } = new List<Admission>();
}

