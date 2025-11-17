using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class NotificationPreferenceRepository : BaseRepository<NotificationPreference>, INotificationPreferenceRepository
{
    public NotificationPreferenceRepository(ApplicationDbContext context) : base(context) { }

    public async Task<NotificationPreference?> GetNotificationPreferenceByUserAsync(int userId)
        => await _dbSet.Include(np => np.User)
                      .FirstOrDefaultAsync(np => np.UserId == userId);

    public async Task<NotificationPreference?> GetNotificationPreferenceWithDetailsAsync(int id)
        => await _dbSet.Include(np => np.User)
                      .FirstOrDefaultAsync(np => np.Id == id);
}

