namespace EHosp.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty; // e.g., "101", "ICU-01"
    public int Floor { get; set; }
    public string? Building { get; set; }
    public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance, Reserved
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int RoomTypeId { get; set; }
    public int? DepartmentId { get; set; }

    // Navigation properties
    public RoomType RoomType { get; set; } = null!;
    public Department? Department { get; set; }
    public ICollection<Bed> Beds { get; set; } = new List<Bed>();
    public ICollection<Admission> Admissions { get; set; } = new List<Admission>();
}

