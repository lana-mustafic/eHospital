using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class BedRepository : BaseRepository<Bed>, IBedRepository
{
    public BedRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Bed?> GetBedWithDetailsAsync(int id)
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(b => b.Room)
                      .ThenInclude(r => r.Department)
                      .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<IEnumerable<Bed>> GetAllBedsWithDetailsAsync()
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(b => b.Room)
                      .ThenInclude(r => r.Department)
                      .OrderBy(b => b.Room.Floor)
                      .ThenBy(b => b.Room.RoomNumber)
                      .ThenBy(b => b.BedNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Bed>> GetBedsByRoomAsync(int roomId)
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .Where(b => b.RoomId == roomId)
                      .OrderBy(b => b.BedNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Bed>> GetBedsByStatusAsync(string status)
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .Where(b => b.Status == status)
                      .OrderBy(b => b.Room.RoomNumber)
                      .ThenBy(b => b.BedNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Bed>> GetAvailableBedsAsync()
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .Where(b => b.Status == "Available" && b.IsActive)
                      .OrderBy(b => b.Room.RoomNumber)
                      .ThenBy(b => b.BedNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Bed>> GetAvailableBedsByRoomAsync(int roomId)
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .Where(b => b.RoomId == roomId && b.Status == "Available" && b.IsActive)
                      .OrderBy(b => b.BedNumber)
                      .ToListAsync();

    public async Task<Bed?> GetBedByNumberAndRoomAsync(string bedNumber, int roomId)
        => await _dbSet.Include(b => b.Room)
                      .ThenInclude(r => r.RoomType)
                      .FirstOrDefaultAsync(b => b.BedNumber == bedNumber && b.RoomId == roomId);
}

