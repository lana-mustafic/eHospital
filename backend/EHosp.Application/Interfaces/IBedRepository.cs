using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IBedRepository : IRepository<Bed>
{
    Task<Bed?> GetBedWithDetailsAsync(int id);
    Task<IEnumerable<Bed>> GetAllBedsWithDetailsAsync();
    Task<IEnumerable<Bed>> GetBedsByRoomAsync(int roomId);
    Task<IEnumerable<Bed>> GetBedsByStatusAsync(string status);
    Task<IEnumerable<Bed>> GetAvailableBedsAsync();
    Task<IEnumerable<Bed>> GetAvailableBedsByRoomAsync(int roomId);
    Task<Bed?> GetBedByNumberAndRoomAsync(string bedNumber, int roomId);
}

