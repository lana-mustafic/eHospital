using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IRoomTransferRepository : IRepository<RoomTransfer>
{
    Task<RoomTransfer?> GetRoomTransferWithDetailsAsync(int id);
    Task<IEnumerable<RoomTransfer>> GetAllRoomTransfersWithDetailsAsync();
    Task<IEnumerable<RoomTransfer>> GetRoomTransfersByAdmissionAsync(int admissionId);
    Task<IEnumerable<RoomTransfer>> GetRoomTransfersByRoomAsync(int roomId);
}

