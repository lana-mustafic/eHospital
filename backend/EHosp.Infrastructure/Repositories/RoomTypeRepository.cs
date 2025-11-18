using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class RoomTypeRepository : BaseRepository<RoomType>, IRoomTypeRepository
{
    public RoomTypeRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<RoomType>> GetActiveRoomTypesAsync()
        => await _dbSet.Where(rt => rt.IsActive)
                      .OrderBy(rt => rt.Name)
                      .ToListAsync();
}

