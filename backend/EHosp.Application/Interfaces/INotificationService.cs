using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetNotificationsByUserAsync(int userId);
    Task<IEnumerable<NotificationDto>> GetUnreadNotificationsByUserAsync(int userId);
    Task<int> GetUnreadNotificationCountAsync(int userId);
    Task<NotificationDto?> GetNotificationByIdAsync(int id);
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(int userId);
    Task DeleteNotificationAsync(int id);
    
    // Notification preferences
    Task<NotificationPreferenceDto?> GetNotificationPreferenceByUserAsync(int userId);
    Task<NotificationPreferenceDto> CreateOrUpdateNotificationPreferenceAsync(int userId, UpdateNotificationPreferenceDto updateDto);
    
    // Helper methods for sending notifications
    Task SendNotificationAsync(int userId, string title, string message, string type, string category, string priority = "Normal", string? relatedEntityType = null, int? relatedEntityId = null);
    Task SendCriticalAlertAsync(int userId, string title, string message, string category, string? relatedEntityType = null, int? relatedEntityId = null);
}

