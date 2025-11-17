namespace EHosp.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Info, Warning, Error, Success, Critical
    public string Category { get; set; } = string.Empty; // Appointment, LabResult, VitalSigns, System, General
    public string Priority { get; set; } = "Normal"; // Low, Normal, High, Critical
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    // Related entity information (for linking to specific records)
    public string? RelatedEntityType { get; set; } // Appointment, LabTest, VitalSigns, etc.
    public int? RelatedEntityId { get; set; }
    
    // Notification channels
    public bool SentViaEmail { get; set; } = false;
    public bool SentViaSms { get; set; } = false;
    public bool SentViaInApp { get; set; } = true;
    public DateTime? EmailSentAt { get; set; }
    public DateTime? SmsSentAt { get; set; }
    
    // Foreign keys
    public int UserId { get; set; }
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public User? CreatedByUser { get; set; }
}

