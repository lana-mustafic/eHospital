namespace EHosp.Domain.Entities;

public class Queue
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public int QueueNumber { get; set; }
    public string Status { get; set; } = "Waiting"; // Waiting, InProgress, Completed, Skipped, Cancelled
    public DateTime QueueDate { get; set; }
    public DateTime? CalledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int EstimatedWaitTimeMinutes { get; set; }
    public int ActualWaitTimeMinutes { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Appointment Appointment { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
}

