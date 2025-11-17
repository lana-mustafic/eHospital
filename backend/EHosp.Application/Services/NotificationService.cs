using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationPreferenceRepository _notificationPreferenceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ILogger<NotificationService> _logger;
    private readonly IAuditService _auditService;

    public NotificationService(
        INotificationRepository notificationRepository,
        INotificationPreferenceRepository notificationPreferenceRepository,
        IUserRepository userRepository,
        IEmailService emailService,
        ISmsService smsService,
        ILogger<NotificationService> logger,
        IAuditService auditService)
    {
        _notificationRepository = notificationRepository;
        _notificationPreferenceRepository = notificationPreferenceRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _smsService = smsService;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<NotificationDto>> GetNotificationsByUserAsync(int userId)
    {
        var notifications = await _notificationRepository.GetNotificationsByUserAsync(userId);
        return notifications.Select(MapToDto);
    }

    public async Task<IEnumerable<NotificationDto>> GetUnreadNotificationsByUserAsync(int userId)
    {
        var notifications = await _notificationRepository.GetUnreadNotificationsByUserAsync(userId);
        return notifications.Select(MapToDto);
    }

    public async Task<int> GetUnreadNotificationCountAsync(int userId)
    {
        return await _notificationRepository.GetUnreadNotificationCountAsync(userId);
    }

    public async Task<NotificationDto?> GetNotificationByIdAsync(int id)
    {
        var notification = await _notificationRepository.GetNotificationWithDetailsAsync(id);
        return notification != null ? MapToDto(notification) : null;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(createNotificationDto.UserId);
        if (user == null)
        {
            throw new ArgumentException("User not found");
        }

        // Get user preferences
        var preferences = await _notificationPreferenceRepository.GetNotificationPreferenceByUserAsync(createNotificationDto.UserId);
        
        // Determine which channels to use based on preferences and request
        bool sendEmail = createNotificationDto.SendEmail && (preferences?.EmailEnabled ?? true);
        bool sendSms = createNotificationDto.SendSms && (preferences?.SmsEnabled ?? false);
        bool sendInApp = createNotificationDto.SendInApp && (preferences?.InAppEnabled ?? true);

        // Check category-specific preferences
        if (preferences != null)
        {
            switch (createNotificationDto.Category)
            {
                case "Appointment":
                    sendEmail = sendEmail && preferences.EmailAppointmentReminders;
                    sendSms = sendSms && preferences.SmsAppointmentReminders;
                    sendInApp = sendInApp && preferences.InAppAppointmentReminders;
                    break;
                case "LabResult":
                    sendEmail = sendEmail && preferences.EmailLabResults;
                    sendSms = sendSms && preferences.SmsLabResults;
                    sendInApp = sendInApp && preferences.InAppLabResults;
                    break;
                case "Critical":
                    sendEmail = sendEmail && preferences.EmailCriticalAlerts;
                    sendSms = sendSms && preferences.SmsCriticalAlerts;
                    sendInApp = sendInApp && preferences.InAppCriticalAlerts;
                    break;
                case "System":
                    sendEmail = sendEmail && preferences.EmailSystemNotifications;
                    sendSms = sendSms && preferences.SmsSystemNotifications;
                    sendInApp = sendInApp && preferences.InAppSystemNotifications;
                    break;
            }
        }

        var notification = new Notification
        {
            Title = createNotificationDto.Title,
            Message = createNotificationDto.Message,
            Type = createNotificationDto.Type,
            Category = createNotificationDto.Category,
            Priority = createNotificationDto.Priority,
            ExpiresAt = createNotificationDto.ExpiresAt,
            RelatedEntityType = createNotificationDto.RelatedEntityType,
            RelatedEntityId = createNotificationDto.RelatedEntityId,
            UserId = createNotificationDto.UserId,
            CreatedByUserId = createNotificationDto.CreatedByUserId,
            SentViaInApp = sendInApp,
            SentViaEmail = sendEmail,
            SentViaSms = sendSms,
            CreatedAt = DateTime.UtcNow
        };

        var createdNotification = await _notificationRepository.AddAsync(notification);

        // Send via email if enabled
        if (sendEmail && !string.IsNullOrEmpty(user.Email))
        {
            try
            {
                var emailBody = GenerateEmailBody(notification);
                var emailSent = await _emailService.SendEmailAsync(
                    user.Email,
                    $"{user.FirstName} {user.LastName}",
                    notification.Title,
                    emailBody
                );
                if (emailSent)
                {
                    notification.EmailSentAt = DateTime.UtcNow;
                    await _notificationRepository.UpdateAsync(notification);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email notification to {user.Email}");
            }
        }

        // Send via SMS if enabled
        if (sendSms && !string.IsNullOrEmpty(user.PhoneNumber))
        {
            try
            {
                var smsMessage = $"{notification.Title}: {notification.Message}";
                var smsSent = await _smsService.SendSmsAsync(user.PhoneNumber, smsMessage);
                if (smsSent)
                {
                    notification.SmsSentAt = DateTime.UtcNow;
                    await _notificationRepository.UpdateAsync(notification);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending SMS notification to {user.PhoneNumber}");
            }
        }

        await _auditService.WriteAsync(
            createNotificationDto.CreatedByUserId?.ToString() ?? "system",
            "System",
            "Create",
            "Notification",
            createdNotification.Id.ToString(),
            $"UserId={createNotificationDto.UserId}, Category={createNotificationDto.Category}"
        );

        var notificationWithDetails = await _notificationRepository.GetNotificationWithDetailsAsync(createdNotification.Id);
        return MapToDto(notificationWithDetails!);
    }

    public async Task MarkAsReadAsync(int id)
    {
        await _notificationRepository.MarkAsReadAsync(id);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
    }

    public async Task DeleteNotificationAsync(int id)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null)
        {
            throw new ArgumentException("Notification not found");
        }

        await _notificationRepository.DeleteAsync(notification);
        await _auditService.WriteAsync("system", "System", "Delete", "Notification", notification.Id.ToString(), "Deleted");
    }

    public async Task<NotificationPreferenceDto?> GetNotificationPreferenceByUserAsync(int userId)
    {
        var preference = await _notificationPreferenceRepository.GetNotificationPreferenceByUserAsync(userId);
        return preference != null ? MapPreferenceToDto(preference) : null;
    }

    public async Task<NotificationPreferenceDto> CreateOrUpdateNotificationPreferenceAsync(int userId, UpdateNotificationPreferenceDto updateDto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found");
        }

        var preference = await _notificationPreferenceRepository.GetNotificationPreferenceByUserAsync(userId);

        if (preference == null)
        {
            // Create new preference
            preference = new NotificationPreference
            {
                UserId = userId,
                EmailEnabled = updateDto.EmailEnabled ?? true,
                EmailAppointmentReminders = updateDto.EmailAppointmentReminders ?? true,
                EmailLabResults = updateDto.EmailLabResults ?? true,
                EmailCriticalAlerts = updateDto.EmailCriticalAlerts ?? true,
                EmailSystemNotifications = updateDto.EmailSystemNotifications ?? true,
                SmsEnabled = updateDto.SmsEnabled ?? false,
                SmsAppointmentReminders = updateDto.SmsAppointmentReminders ?? false,
                SmsLabResults = updateDto.SmsLabResults ?? false,
                SmsCriticalAlerts = updateDto.SmsCriticalAlerts ?? true,
                SmsSystemNotifications = updateDto.SmsSystemNotifications ?? false,
                InAppEnabled = updateDto.InAppEnabled ?? true,
                InAppAppointmentReminders = updateDto.InAppAppointmentReminders ?? true,
                InAppLabResults = updateDto.InAppLabResults ?? true,
                InAppCriticalAlerts = updateDto.InAppCriticalAlerts ?? true,
                InAppSystemNotifications = updateDto.InAppSystemNotifications ?? true,
                AppointmentReminderHoursBefore = updateDto.AppointmentReminderHoursBefore ?? 24,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationPreferenceRepository.AddAsync(preference);
        }
        else
        {
            // Update existing preference
            if (updateDto.EmailEnabled.HasValue)
                preference.EmailEnabled = updateDto.EmailEnabled.Value;
            if (updateDto.EmailAppointmentReminders.HasValue)
                preference.EmailAppointmentReminders = updateDto.EmailAppointmentReminders.Value;
            if (updateDto.EmailLabResults.HasValue)
                preference.EmailLabResults = updateDto.EmailLabResults.Value;
            if (updateDto.EmailCriticalAlerts.HasValue)
                preference.EmailCriticalAlerts = updateDto.EmailCriticalAlerts.Value;
            if (updateDto.EmailSystemNotifications.HasValue)
                preference.EmailSystemNotifications = updateDto.EmailSystemNotifications.Value;
            if (updateDto.SmsEnabled.HasValue)
                preference.SmsEnabled = updateDto.SmsEnabled.Value;
            if (updateDto.SmsAppointmentReminders.HasValue)
                preference.SmsAppointmentReminders = updateDto.SmsAppointmentReminders.Value;
            if (updateDto.SmsLabResults.HasValue)
                preference.SmsLabResults = updateDto.SmsLabResults.Value;
            if (updateDto.SmsCriticalAlerts.HasValue)
                preference.SmsCriticalAlerts = updateDto.SmsCriticalAlerts.Value;
            if (updateDto.SmsSystemNotifications.HasValue)
                preference.SmsSystemNotifications = updateDto.SmsSystemNotifications.Value;
            if (updateDto.InAppEnabled.HasValue)
                preference.InAppEnabled = updateDto.InAppEnabled.Value;
            if (updateDto.InAppAppointmentReminders.HasValue)
                preference.InAppAppointmentReminders = updateDto.InAppAppointmentReminders.Value;
            if (updateDto.InAppLabResults.HasValue)
                preference.InAppLabResults = updateDto.InAppLabResults.Value;
            if (updateDto.InAppCriticalAlerts.HasValue)
                preference.InAppCriticalAlerts = updateDto.InAppCriticalAlerts.Value;
            if (updateDto.InAppSystemNotifications.HasValue)
                preference.InAppSystemNotifications = updateDto.InAppSystemNotifications.Value;
            if (updateDto.AppointmentReminderHoursBefore.HasValue)
                preference.AppointmentReminderHoursBefore = updateDto.AppointmentReminderHoursBefore.Value;

            preference.UpdatedAt = DateTime.UtcNow;
            await _notificationPreferenceRepository.UpdateAsync(preference);
        }

        var preferenceWithDetails = await _notificationPreferenceRepository.GetNotificationPreferenceWithDetailsAsync(preference.Id);
        return MapPreferenceToDto(preferenceWithDetails!);
    }

    public async Task SendNotificationAsync(int userId, string title, string message, string type, string category, string priority = "Normal", string? relatedEntityType = null, int? relatedEntityId = null)
    {
        var createDto = new CreateNotificationDto
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            Category = category,
            Priority = priority,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            SendEmail = true,
            SendSms = true,
            SendInApp = true
        };

        await CreateNotificationAsync(createDto);
    }

    public async Task SendCriticalAlertAsync(int userId, string title, string message, string category, string? relatedEntityType = null, int? relatedEntityId = null)
    {
        await SendNotificationAsync(userId, title, message, "Error", category, "Critical", relatedEntityType, relatedEntityId);
    }

    private string GenerateEmailBody(Notification notification)
    {
        return $@"
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #667eea; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9fafb; }}
        .footer {{ padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>{notification.Title}</h2>
        </div>
        <div class=""content"">
            <p>{notification.Message}</p>
            <p><strong>Category:</strong> {notification.Category}</p>
            <p><strong>Priority:</strong> {notification.Priority}</p>
            <p><strong>Date:</strong> {notification.CreatedAt:yyyy-MM-dd HH:mm}</p>
        </div>
        <div class=""footer"">
            <p>This is an automated notification from eHospital System</p>
        </div>
    </div>
</body>
</html>";
    }

    private static NotificationDto MapToDto(Notification notification) => new()
    {
        Id = notification.Id,
        Title = notification.Title,
        Message = notification.Message,
        Type = notification.Type,
        Category = notification.Category,
        Priority = notification.Priority,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt,
        ReadAt = notification.ReadAt,
        ExpiresAt = notification.ExpiresAt,
        RelatedEntityType = notification.RelatedEntityType,
        RelatedEntityId = notification.RelatedEntityId,
        SentViaEmail = notification.SentViaEmail,
        SentViaSms = notification.SentViaSms,
        SentViaInApp = notification.SentViaInApp,
        EmailSentAt = notification.EmailSentAt,
        SmsSentAt = notification.SmsSentAt,
        UserId = notification.UserId,
        UserName = $"{notification.User?.FirstName} {notification.User?.LastName}".Trim(),
        CreatedByUserId = notification.CreatedByUserId,
        CreatedByUserName = notification.CreatedByUser != null
            ? $"{notification.CreatedByUser.FirstName} {notification.CreatedByUser.LastName}".Trim()
            : null
    };

    private static NotificationPreferenceDto MapPreferenceToDto(NotificationPreference preference) => new()
    {
        Id = preference.Id,
        UserId = preference.UserId,
        UserName = $"{preference.User?.FirstName} {preference.User?.LastName}".Trim(),
        EmailEnabled = preference.EmailEnabled,
        EmailAppointmentReminders = preference.EmailAppointmentReminders,
        EmailLabResults = preference.EmailLabResults,
        EmailCriticalAlerts = preference.EmailCriticalAlerts,
        EmailSystemNotifications = preference.EmailSystemNotifications,
        SmsEnabled = preference.SmsEnabled,
        SmsAppointmentReminders = preference.SmsAppointmentReminders,
        SmsLabResults = preference.SmsLabResults,
        SmsCriticalAlerts = preference.SmsCriticalAlerts,
        SmsSystemNotifications = preference.SmsSystemNotifications,
        InAppEnabled = preference.InAppEnabled,
        InAppAppointmentReminders = preference.InAppAppointmentReminders,
        InAppLabResults = preference.InAppLabResults,
        InAppCriticalAlerts = preference.InAppCriticalAlerts,
        InAppSystemNotifications = preference.InAppSystemNotifications,
        AppointmentReminderHoursBefore = preference.AppointmentReminderHoursBefore,
        CreatedAt = preference.CreatedAt,
        UpdatedAt = preference.UpdatedAt
    };
}

