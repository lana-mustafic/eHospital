namespace EHosp.Domain.Entities;
public class DoctorSchedule
{
    public int Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;

    // Foreign keys
    public int DoctorId { get; set; }

    // Navigation properties
    public Doctor Doctor { get; set; } = null!;
}