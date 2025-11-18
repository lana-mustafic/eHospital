using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class RoomRepository : BaseRepository<Room>, IRoomRepository
{
    public RoomRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Room?> GetRoomWithDetailsAsync(int id)
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IEnumerable<Room>> GetAllRoomsWithDetailsAsync()
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .OrderBy(r => r.Floor)
                      .ThenBy(r => r.RoomNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Room>> GetRoomsByTypeAsync(int roomTypeId)
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .Where(r => r.RoomTypeId == roomTypeId)
                      .OrderBy(r => r.RoomNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Room>> GetRoomsByDepartmentAsync(int departmentId)
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .Where(r => r.DepartmentId == departmentId)
                      .OrderBy(r => r.RoomNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Room>> GetRoomsByStatusAsync(string status)
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .Where(r => r.Status == status)
                      .OrderBy(r => r.RoomNumber)
                      .ToListAsync();

    public async Task<IEnumerable<Room>> GetAvailableRoomsAsync()
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .Where(r => r.Status == "Available" && r.IsActive)
                      .OrderBy(r => r.RoomNumber)
                      .ToListAsync();

    public async Task<Room?> GetRoomByNumberAsync(string roomNumber)
        => await _dbSet.Include(r => r.RoomType)
                      .Include(r => r.Department)
                      .Include(r => r.Beds)
                      .FirstOrDefaultAsync(r => r.RoomNumber == roomNumber);
}

