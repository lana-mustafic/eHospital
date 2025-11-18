using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IRoomRepository : IRepository<Room>
{
    Task<Room?> GetRoomWithDetailsAsync(int id);
    Task<IEnumerable<Room>> GetAllRoomsWithDetailsAsync();
    Task<IEnumerable<Room>> GetRoomsByTypeAsync(int roomTypeId);
    Task<IEnumerable<Room>> GetRoomsByDepartmentAsync(int departmentId);
    Task<IEnumerable<Room>> GetRoomsByStatusAsync(string status);
    Task<IEnumerable<Room>> GetAvailableRoomsAsync();
    Task<Room?> GetRoomByNumberAsync(string roomNumber);
}

