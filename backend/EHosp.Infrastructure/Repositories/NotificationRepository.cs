using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Notification?> GetNotificationWithDetailsAsync(int id)
        => await _dbSet.Include(n => n.User)
                      .ThenInclude(u => u.Role)
                      .Include(n => n.CreatedByUser)
                      .FirstOrDefaultAsync(n => n.Id == id);

    public async Task<IEnumerable<Notification>> GetNotificationsByUserAsync(int userId)
        => await _dbSet.Include(n => n.User)
                      .Include(n => n.CreatedByUser)
                      .Where(n => n.UserId == userId)
                      .OrderByDescending(n => n.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<Notification>> GetUnreadNotificationsByUserAsync(int userId)
        => await _dbSet.Include(n => n.User)
                      .Include(n => n.CreatedByUser)
                      .Where(n => n.UserId == userId && !n.IsRead && (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow))
                      .OrderByDescending(n => n.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<Notification>> GetNotificationsByUserAndCategoryAsync(int userId, string category)
        => await _dbSet.Include(n => n.User)
                      .Include(n => n.CreatedByUser)
                      .Where(n => n.UserId == userId && n.Category == category)
                      .OrderByDescending(n => n.CreatedAt)
                      .ToListAsync();

    public async Task<int> GetUnreadNotificationCountAsync(int userId)
        => await _dbSet.CountAsync(n => n.UserId == userId && !n.IsRead && (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow));

    public async Task MarkAsReadAsync(int id)
    {
        var notification = await _dbSet.FindAsync(id);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _dbSet.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteExpiredNotificationsAsync()
    {
        var expiredNotifications = await _dbSet
            .Where(n => n.ExpiresAt != null && n.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        
        _dbSet.RemoveRange(expiredNotifications);
        await _context.SaveChangesAsync();
    }
}

