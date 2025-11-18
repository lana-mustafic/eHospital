using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IBedRepository _bedRepository;
    private readonly ILogger<RoomService> _logger;

    public RoomService(
        IRoomRepository roomRepository,
        IBedRepository bedRepository,
        ILogger<RoomService> logger)
    {
        _roomRepository = roomRepository;
        _bedRepository = bedRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<RoomDto>> GetAllRoomsAsync()
    {
        var rooms = await _roomRepository.GetAllRoomsWithDetailsAsync();
        return rooms.Select(r => MapToDto(r));
    }

    public async Task<RoomDto?> GetRoomByIdAsync(int id)
    {
        var room = await _roomRepository.GetRoomWithDetailsAsync(id);
        return room != null ? MapToDto(room) : null;
    }

    public async Task<IEnumerable<RoomDto>> GetRoomsByTypeAsync(int roomTypeId)
    {
        var rooms = await _roomRepository.GetRoomsByTypeAsync(roomTypeId);
        return rooms.Select(MapToDto);
    }

    public async Task<IEnumerable<RoomDto>> GetRoomsByDepartmentAsync(int departmentId)
    {
        var rooms = await _roomRepository.GetRoomsByDepartmentAsync(departmentId);
        return rooms.Select(MapToDto);
    }

    public async Task<IEnumerable<RoomDto>> GetRoomsByStatusAsync(string status)
    {
        var rooms = await _roomRepository.GetRoomsByStatusAsync(status);
        return rooms.Select(MapToDto);
    }

    public async Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync()
    {
        var rooms = await _roomRepository.GetAvailableRoomsAsync();
        return rooms.Select(MapToDto);
    }

    public async Task<IEnumerable<RoomAvailabilityDto>> GetRoomAvailabilityAsync()
    {
        var rooms = await _roomRepository.GetAllRoomsWithDetailsAsync();
        var result = new List<RoomAvailabilityDto>();

        foreach (var room in rooms.Where(r => r.IsActive))
        {
            var beds = await _bedRepository.GetBedsByRoomAsync(room.Id);
            var availableBeds = beds.Where(b => b.Status == "Available" && b.IsActive).ToList();

            result.Add(new RoomAvailabilityDto
            {
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                RoomTypeName = room.RoomType.Name,
                Floor = room.Floor,
                Building = room.Building,
                TotalBeds = beds.Count(b => b.IsActive),
                AvailableBeds = availableBeds.Count,
                OccupiedBeds = beds.Count(b => b.Status == "Occupied" && b.IsActive),
                Status = room.Status,
                AvailableBedsList = availableBeds.Select(b => new BedAvailabilityDto
                {
                    BedId = b.Id,
                    BedNumber = b.BedNumber,
                    Status = b.Status
                }).ToList()
            });
        }

        return result;
    }

    public async Task<RoomDto> CreateRoomAsync(CreateRoomDto createRoomDto)
    {
        // Check if room number already exists
        var existingRoom = await _roomRepository.GetRoomByNumberAsync(createRoomDto.RoomNumber);
        if (existingRoom != null)
        {
            throw new InvalidOperationException($"Room with number {createRoomDto.RoomNumber} already exists");
        }

        var room = new Room
        {
            RoomNumber = createRoomDto.RoomNumber,
            Floor = createRoomDto.Floor,
            Building = createRoomDto.Building,
            Status = createRoomDto.Status,
            IsActive = createRoomDto.IsActive,
            RoomTypeId = createRoomDto.RoomTypeId,
            DepartmentId = createRoomDto.DepartmentId
        };

        var createdRoom = await _roomRepository.AddAsync(room);
        _logger.LogInformation("Created room: {RoomNumber}", createdRoom.RoomNumber);

        var roomWithDetails = await _roomRepository.GetRoomWithDetailsAsync(createdRoom.Id);
        return MapToDto(roomWithDetails!);
    }

    public async Task UpdateRoomAsync(int id, UpdateRoomDto updateRoomDto)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null)
        {
            throw new ArgumentException("Room not found");
        }

        if (!string.IsNullOrEmpty(updateRoomDto.RoomNumber) && updateRoomDto.RoomNumber != room.RoomNumber)
        {
            var existingRoom = await _roomRepository.GetRoomByNumberAsync(updateRoomDto.RoomNumber);
            if (existingRoom != null && existingRoom.Id != id)
            {
                throw new InvalidOperationException($"Room with number {updateRoomDto.RoomNumber} already exists");
            }
            room.RoomNumber = updateRoomDto.RoomNumber;
        }

        if (updateRoomDto.Floor.HasValue)
            room.Floor = updateRoomDto.Floor.Value;
        if (updateRoomDto.Building != null)
            room.Building = updateRoomDto.Building;
        if (!string.IsNullOrEmpty(updateRoomDto.Status))
            room.Status = updateRoomDto.Status;
        if (updateRoomDto.IsActive.HasValue)
            room.IsActive = updateRoomDto.IsActive.Value;
        if (updateRoomDto.RoomTypeId.HasValue)
            room.RoomTypeId = updateRoomDto.RoomTypeId.Value;
        if (updateRoomDto.DepartmentId.HasValue)
            room.DepartmentId = updateRoomDto.DepartmentId;

        room.UpdatedAt = DateTime.UtcNow;

        await _roomRepository.UpdateAsync(room);
        _logger.LogInformation("Updated room: {RoomId}", id);
    }

    public async Task DeleteRoomAsync(int id)
    {
        var room = await _roomRepository.GetRoomWithDetailsAsync(id);
        if (room == null)
        {
            throw new ArgumentException("Room not found");
        }

        // Check if room has active admissions
        var activeAdmissions = room.Admissions?.Where(a => a.Status == "Admitted").ToList();
        if (activeAdmissions != null && activeAdmissions.Any())
        {
            throw new InvalidOperationException("Cannot delete room with active admissions. Please discharge patients first.");
        }

        await _roomRepository.DeleteAsync(room);
        _logger.LogInformation("Deleted room: {RoomId}", id);
    }

    private static RoomDto MapToDto(Room room)
    {
        var beds = room.Beds?.ToList() ?? new List<Bed>();
        return new RoomDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            Floor = room.Floor,
            Building = room.Building,
            Status = room.Status,
            IsActive = room.IsActive,
            CreatedAt = room.CreatedAt,
            UpdatedAt = room.UpdatedAt,
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = room.RoomType?.Name,
            DepartmentId = room.DepartmentId,
            DepartmentName = room.Department?.Name,
            TotalBeds = beds.Count(b => b.IsActive),
            AvailableBeds = beds.Count(b => b.Status == "Available" && b.IsActive),
            OccupiedBeds = beds.Count(b => b.Status == "Occupied" && b.IsActive),
            Beds = beds.Select(b => new BedDto
            {
                Id = b.Id,
                BedNumber = b.BedNumber,
                Status = b.Status,
                IsActive = b.IsActive,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
                RoomId = b.RoomId,
                RoomNumber = room.RoomNumber,
                RoomTypeName = room.RoomType?.Name,
                Floor = room.Floor,
                Building = room.Building
            }).ToList()
        };
    }
}

