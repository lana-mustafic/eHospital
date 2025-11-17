namespace EHosp.Domain.Entities;

public class NotificationPreference
{
    public int Id { get; set; }
    
    // Email preferences
    public bool EmailEnabled { get; set; } = true;
    public bool EmailAppointmentReminders { get; set; } = true;
    public bool EmailLabResults { get; set; } = true;
    public bool EmailCriticalAlerts { get; set; } = true;
    public bool EmailSystemNotifications { get; set; } = true;
    
    // SMS preferences
    public bool SmsEnabled { get; set; } = false;
    public bool SmsAppointmentReminders { get; set; } = false;
    public bool SmsLabResults { get; set; } = false;
    public bool SmsCriticalAlerts { get; set; } = true;
    public bool SmsSystemNotifications { get; set; } = false;
    
    // In-app preferences
    public bool InAppEnabled { get; set; } = true;
    public bool InAppAppointmentReminders { get; set; } = true;
    public bool InAppLabResults { get; set; } = true;
    public bool InAppCriticalAlerts { get; set; } = true;
    public bool InAppSystemNotifications { get; set; } = true;
    
    // Reminder settings
    public int AppointmentReminderHoursBefore { get; set; } = 24; // Default 24 hours before
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int UserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}

