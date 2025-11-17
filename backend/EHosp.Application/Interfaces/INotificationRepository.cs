using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<Notification?> GetNotificationWithDetailsAsync(int id);
    Task<IEnumerable<Notification>> GetNotificationsByUserAsync(int userId);
    Task<IEnumerable<Notification>> GetUnreadNotificationsByUserAsync(int userId);
    Task<IEnumerable<Notification>> GetNotificationsByUserAndCategoryAsync(int userId, string category);
    Task<int> GetUnreadNotificationCountAsync(int userId);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(int userId);
    Task DeleteExpiredNotificationsAsync();
}

