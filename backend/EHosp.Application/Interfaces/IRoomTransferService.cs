using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IRoomTransferService
{
    Task<IEnumerable<RoomTransferDto>> GetAllRoomTransfersAsync();
    Task<RoomTransferDto?> GetRoomTransferByIdAsync(int id);
    Task<IEnumerable<RoomTransferDto>> GetRoomTransfersByAdmissionAsync(int admissionId);
    Task<IEnumerable<RoomTransferDto>> GetRoomTransfersByRoomAsync(int roomId);
    Task<RoomTransferDto> CreateRoomTransferAsync(CreateRoomTransferDto createRoomTransferDto);
    Task DeleteRoomTransferAsync(int id);
}

