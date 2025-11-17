using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface INotificationPreferenceRepository : IRepository<NotificationPreference>
{
    Task<NotificationPreference?> GetNotificationPreferenceByUserAsync(int userId);
    Task<NotificationPreference?> GetNotificationPreferenceWithDetailsAsync(int id);
}

