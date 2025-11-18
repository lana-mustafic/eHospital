using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IRoomService
{
    Task<IEnumerable<RoomDto>> GetAllRoomsAsync();
    Task<RoomDto?> GetRoomByIdAsync(int id);
    Task<IEnumerable<RoomDto>> GetRoomsByTypeAsync(int roomTypeId);
    Task<IEnumerable<RoomDto>> GetRoomsByDepartmentAsync(int departmentId);
    Task<IEnumerable<RoomDto>> GetRoomsByStatusAsync(string status);
    Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync();
    Task<IEnumerable<RoomAvailabilityDto>> GetRoomAvailabilityAsync();
    Task<RoomDto> CreateRoomAsync(CreateRoomDto createRoomDto);
    Task UpdateRoomAsync(int id, UpdateRoomDto updateRoomDto);
    Task DeleteRoomAsync(int id);
}

