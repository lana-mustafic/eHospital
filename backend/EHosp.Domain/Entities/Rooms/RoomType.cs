namespace EHosp.Domain.Entities;

public class RoomType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // e.g., "Single", "Double", "ICU", "Ward"
    public string Description { get; set; } = string.Empty;
    public decimal BaseRatePerDay { get; set; }
    public int MaxOccupancy { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}

