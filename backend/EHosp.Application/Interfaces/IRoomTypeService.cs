using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IRoomTypeService
{
    Task<IEnumerable<RoomTypeDto>> GetAllRoomTypesAsync();
    Task<RoomTypeDto?> GetRoomTypeByIdAsync(int id);
    Task<IEnumerable<RoomTypeDto>> GetActiveRoomTypesAsync();
    Task<RoomTypeDto> CreateRoomTypeAsync(CreateRoomTypeDto createRoomTypeDto);
    Task UpdateRoomTypeAsync(int id, UpdateRoomTypeDto updateRoomTypeDto);
    Task DeleteRoomTypeAsync(int id);
}

