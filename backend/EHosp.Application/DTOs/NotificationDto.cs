namespace EHosp.Application.DTOs;

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public bool SentViaEmail { get; set; }
    public bool SentViaSms { get; set; }
    public bool SentViaInApp { get; set; }
    public DateTime? EmailSentAt { get; set; }
    public DateTime? SmsSentAt { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
}

public class CreateNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "Info";
    public string Category { get; set; } = "General";
    public string Priority { get; set; } = "Normal";
    public DateTime? ExpiresAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public int UserId { get; set; }
    public int? CreatedByUserId { get; set; }
    public bool SendEmail { get; set; } = false;
    public bool SendSms { get; set; } = false;
    public bool SendInApp { get; set; } = true;
}

public class UpdateNotificationDto
{
    public bool? IsRead { get; set; }
}

public class NotificationPreferenceDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    
    // Email preferences
    public bool EmailEnabled { get; set; }
    public bool EmailAppointmentReminders { get; set; }
    public bool EmailLabResults { get; set; }
    public bool EmailCriticalAlerts { get; set; }
    public bool EmailSystemNotifications { get; set; }
    
    // SMS preferences
    public bool SmsEnabled { get; set; }
    public bool SmsAppointmentReminders { get; set; }
    public bool SmsLabResults { get; set; }
    public bool SmsCriticalAlerts { get; set; }
    public bool SmsSystemNotifications { get; set; }
    
    // In-app preferences
    public bool InAppEnabled { get; set; }
    public bool InAppAppointmentReminders { get; set; }
    public bool InAppLabResults { get; set; }
    public bool InAppCriticalAlerts { get; set; }
    public bool InAppSystemNotifications { get; set; }
    
    // Reminder settings
    public int AppointmentReminderHoursBefore { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UpdateNotificationPreferenceDto
{
    public bool? EmailEnabled { get; set; }
    public bool? EmailAppointmentReminders { get; set; }
    public bool? EmailLabResults { get; set; }
    public bool? EmailCriticalAlerts { get; set; }
    public bool? EmailSystemNotifications { get; set; }
    public bool? SmsEnabled { get; set; }
    public bool? SmsAppointmentReminders { get; set; }
    public bool? SmsLabResults { get; set; }
    public bool? SmsCriticalAlerts { get; set; }
    public bool? SmsSystemNotifications { get; set; }
    public bool? InAppEnabled { get; set; }
    public bool? InAppAppointmentReminders { get; set; }
    public bool? InAppLabResults { get; set; }
    public bool? InAppCriticalAlerts { get; set; }
    public bool? InAppSystemNotifications { get; set; }
    public int? AppointmentReminderHoursBefore { get; set; }
}

