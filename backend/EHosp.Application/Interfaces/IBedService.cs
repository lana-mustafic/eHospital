using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IBedService
{
    Task<IEnumerable<BedDto>> GetAllBedsAsync();
    Task<BedDto?> GetBedByIdAsync(int id);
    Task<IEnumerable<BedDto>> GetBedsByRoomAsync(int roomId);
    Task<IEnumerable<BedDto>> GetBedsByStatusAsync(string status);
    Task<IEnumerable<BedDto>> GetAvailableBedsAsync();
    Task<IEnumerable<BedDto>> GetAvailableBedsByRoomAsync(int roomId);
    Task<BedDto> CreateBedAsync(CreateBedDto createBedDto);
    Task UpdateBedAsync(int id, UpdateBedDto updateBedDto);
    Task DeleteBedAsync(int id);
}

