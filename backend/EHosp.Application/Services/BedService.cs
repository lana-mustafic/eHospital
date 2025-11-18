using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class BedService : IBedService
{
    private readonly IBedRepository _bedRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly ILogger<BedService> _logger;

    public BedService(
        IBedRepository bedRepository,
        IRoomRepository roomRepository,
        ILogger<BedService> logger)
    {
        _bedRepository = bedRepository;
        _roomRepository = roomRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<BedDto>> GetAllBedsAsync()
    {
        var beds = await _bedRepository.GetAllBedsWithDetailsAsync();
        return beds.Select(MapToDto);
    }

    public async Task<BedDto?> GetBedByIdAsync(int id)
    {
        var bed = await _bedRepository.GetBedWithDetailsAsync(id);
        return bed != null ? MapToDto(bed) : null;
    }

    public async Task<IEnumerable<BedDto>> GetBedsByRoomAsync(int roomId)
    {
        var beds = await _bedRepository.GetBedsByRoomAsync(roomId);
        return beds.Select(MapToDto);
    }

    public async Task<IEnumerable<BedDto>> GetBedsByStatusAsync(string status)
    {
        var beds = await _bedRepository.GetBedsByStatusAsync(status);
        return beds.Select(MapToDto);
    }

    public async Task<IEnumerable<BedDto>> GetAvailableBedsAsync()
    {
        var beds = await _bedRepository.GetAvailableBedsAsync();
        return beds.Select(MapToDto);
    }

    public async Task<IEnumerable<BedDto>> GetAvailableBedsByRoomAsync(int roomId)
    {
        var beds = await _bedRepository.GetAvailableBedsByRoomAsync(roomId);
        return beds.Select(MapToDto);
    }

    public async Task<BedDto> CreateBedAsync(CreateBedDto createBedDto)
    {
        // Verify room exists
        var room = await _roomRepository.GetByIdAsync(createBedDto.RoomId);
        if (room == null)
        {
            throw new ArgumentException("Room not found");
        }

        // Check if bed number already exists in this room
        var existingBed = await _bedRepository.GetBedByNumberAndRoomAsync(createBedDto.BedNumber, createBedDto.RoomId);
        if (existingBed != null)
        {
            throw new InvalidOperationException($"Bed with number {createBedDto.BedNumber} already exists in room {room.RoomNumber}");
        }

        var bed = new Bed
        {
            BedNumber = createBedDto.BedNumber,
            Status = createBedDto.Status,
            IsActive = createBedDto.IsActive,
            RoomId = createBedDto.RoomId
        };

        var createdBed = await _bedRepository.AddAsync(bed);
        _logger.LogInformation("Created bed: {BedNumber} in room {RoomId}", createdBed.BedNumber, createBedDto.RoomId);

        var bedWithDetails = await _bedRepository.GetBedWithDetailsAsync(createdBed.Id);
        return MapToDto(bedWithDetails!);
    }

    public async Task UpdateBedAsync(int id, UpdateBedDto updateBedDto)
    {
        var bed = await _bedRepository.GetByIdAsync(id);
        if (bed == null)
        {
            throw new ArgumentException("Bed not found");
        }

        if (!string.IsNullOrEmpty(updateBedDto.BedNumber) && updateBedDto.BedNumber != bed.BedNumber)
        {
            var existingBed = await _bedRepository.GetBedByNumberAndRoomAsync(updateBedDto.BedNumber, bed.RoomId);
            if (existingBed != null && existingBed.Id != id)
            {
                throw new InvalidOperationException($"Bed with number {updateBedDto.BedNumber} already exists in this room");
            }
            bed.BedNumber = updateBedDto.BedNumber;
        }

        if (!string.IsNullOrEmpty(updateBedDto.Status))
            bed.Status = updateBedDto.Status;
        if (updateBedDto.IsActive.HasValue)
            bed.IsActive = updateBedDto.IsActive.Value;
        if (updateBedDto.RoomId.HasValue)
        {
            var room = await _roomRepository.GetByIdAsync(updateBedDto.RoomId.Value);
            if (room == null)
            {
                throw new ArgumentException("Room not found");
            }
            bed.RoomId = updateBedDto.RoomId.Value;
        }

        bed.UpdatedAt = DateTime.UtcNow;

        await _bedRepository.UpdateAsync(bed);
        _logger.LogInformation("Updated bed: {BedId}", id);
    }

    public async Task DeleteBedAsync(int id)
    {
        var bed = await _bedRepository.GetByIdAsync(id);
        if (bed == null)
        {
            throw new ArgumentException("Bed not found");
        }

        // Check if bed has active admissions
        var activeAdmissions = bed.Admissions?.Where(a => a.Status == "Admitted").ToList();
        if (activeAdmissions != null && activeAdmissions.Any())
        {
            throw new InvalidOperationException("Cannot delete bed with active admissions. Please transfer or discharge patients first.");
        }

        await _bedRepository.DeleteAsync(bed);
        _logger.LogInformation("Deleted bed: {BedId}", id);
    }

    private static BedDto MapToDto(Bed bed)
    {
        return new BedDto
        {
            Id = bed.Id,
            BedNumber = bed.BedNumber,
            Status = bed.Status,
            IsActive = bed.IsActive,
            CreatedAt = bed.CreatedAt,
            UpdatedAt = bed.UpdatedAt,
            RoomId = bed.RoomId,
            RoomNumber = bed.Room?.RoomNumber,
            RoomTypeName = bed.Room?.RoomType?.Name,
            Floor = bed.Room?.Floor,
            Building = bed.Room?.Building
        };
    }
}

