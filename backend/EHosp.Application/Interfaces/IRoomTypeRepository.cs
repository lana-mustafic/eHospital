using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IRoomTypeRepository : IRepository<RoomType>
{
    Task<IEnumerable<RoomType>> GetActiveRoomTypesAsync();
}

