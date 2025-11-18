using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class RoomTypeService : IRoomTypeService
{
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly ILogger<RoomTypeService> _logger;

    public RoomTypeService(
        IRoomTypeRepository roomTypeRepository,
        IRoomRepository roomRepository,
        ILogger<RoomTypeService> logger)
    {
        _roomTypeRepository = roomTypeRepository;
        _roomRepository = roomRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<RoomTypeDto>> GetAllRoomTypesAsync()
    {
        var roomTypes = await _roomTypeRepository.GetAllAsync();
        var result = new List<RoomTypeDto>();

        foreach (var roomType in roomTypes)
        {
            var rooms = await _roomRepository.GetRoomsByTypeAsync(roomType.Id);
            result.Add(MapToDto(roomType, rooms));
        }

        return result;
    }

    public async Task<RoomTypeDto?> GetRoomTypeByIdAsync(int id)
    {
        var roomType = await _roomTypeRepository.GetByIdAsync(id);
        if (roomType == null) return null;

        var rooms = await _roomRepository.GetRoomsByTypeAsync(id);
        return MapToDto(roomType, rooms);
    }

    public async Task<IEnumerable<RoomTypeDto>> GetActiveRoomTypesAsync()
    {
        var roomTypes = await _roomTypeRepository.GetAllAsync();
        var activeRoomTypes = roomTypes.Where(rt => rt.IsActive);
        var result = new List<RoomTypeDto>();

        foreach (var roomType in activeRoomTypes)
        {
            var rooms = await _roomRepository.GetRoomsByTypeAsync(roomType.Id);
            result.Add(MapToDto(roomType, rooms));
        }

        return result;
    }

    public async Task<RoomTypeDto> CreateRoomTypeAsync(CreateRoomTypeDto createRoomTypeDto)
    {
        var roomType = new RoomType
        {
            Name = createRoomTypeDto.Name,
            Description = createRoomTypeDto.Description,
            BaseRatePerDay = createRoomTypeDto.BaseRatePerDay,
            MaxOccupancy = createRoomTypeDto.MaxOccupancy,
            IsActive = createRoomTypeDto.IsActive
        };

        var createdRoomType = await _roomTypeRepository.AddAsync(roomType);
        _logger.LogInformation("Created room type: {RoomTypeName}", createdRoomType.Name);

        return MapToDto(createdRoomType, new List<Room>());
    }

    public async Task UpdateRoomTypeAsync(int id, UpdateRoomTypeDto updateRoomTypeDto)
    {
        var roomType = await _roomTypeRepository.GetByIdAsync(id);
        if (roomType == null)
        {
            throw new ArgumentException("Room type not found");
        }

        if (!string.IsNullOrEmpty(updateRoomTypeDto.Name))
            roomType.Name = updateRoomTypeDto.Name;
        if (!string.IsNullOrEmpty(updateRoomTypeDto.Description))
            roomType.Description = updateRoomTypeDto.Description;
        if (updateRoomTypeDto.BaseRatePerDay.HasValue)
            roomType.BaseRatePerDay = updateRoomTypeDto.BaseRatePerDay.Value;
        if (updateRoomTypeDto.MaxOccupancy.HasValue)
            roomType.MaxOccupancy = updateRoomTypeDto.MaxOccupancy.Value;
        if (updateRoomTypeDto.IsActive.HasValue)
            roomType.IsActive = updateRoomTypeDto.IsActive.Value;

        roomType.UpdatedAt = DateTime.UtcNow;

        await _roomTypeRepository.UpdateAsync(roomType);
        _logger.LogInformation("Updated room type: {RoomTypeId}", id);
    }

    public async Task DeleteRoomTypeAsync(int id)
    {
        var roomType = await _roomTypeRepository.GetByIdAsync(id);
        if (roomType == null)
        {
            throw new ArgumentException("Room type not found");
        }

        var rooms = await _roomRepository.GetRoomsByTypeAsync(id);
        if (rooms.Any())
        {
            throw new InvalidOperationException("Cannot delete room type with assigned rooms. Please remove or reassign rooms first.");
        }

        await _roomTypeRepository.DeleteAsync(roomType);
        _logger.LogInformation("Deleted room type: {RoomTypeId}", id);
    }

    private static RoomTypeDto MapToDto(RoomType roomType, IEnumerable<Room> rooms)
    {
        var roomsList = rooms.ToList();
        return new RoomTypeDto
        {
            Id = roomType.Id,
            Name = roomType.Name,
            Description = roomType.Description,
            BaseRatePerDay = roomType.BaseRatePerDay,
            MaxOccupancy = roomType.MaxOccupancy,
            IsActive = roomType.IsActive,
            CreatedAt = roomType.CreatedAt,
            UpdatedAt = roomType.UpdatedAt,
            TotalRooms = roomsList.Count,
            AvailableRooms = roomsList.Count(r => r.Status == "Available" && r.IsActive)
        };
    }
}

