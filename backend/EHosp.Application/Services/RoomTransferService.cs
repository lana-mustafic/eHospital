using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class RoomTransferService : IRoomTransferService
{
    private readonly IRoomTransferRepository _roomTransferRepository;
    private readonly IAdmissionRepository _admissionRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IBedRepository _bedRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly ILogger<RoomTransferService> _logger;
    private readonly IAuditService _auditService;

    public RoomTransferService(
        IRoomTransferRepository roomTransferRepository,
        IAdmissionRepository admissionRepository,
        IRoomRepository roomRepository,
        IBedRepository bedRepository,
        IDoctorRepository doctorRepository,
        ILogger<RoomTransferService> logger,
        IAuditService auditService)
    {
        _roomTransferRepository = roomTransferRepository;
        _admissionRepository = admissionRepository;
        _roomRepository = roomRepository;
        _bedRepository = bedRepository;
        _doctorRepository = doctorRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<RoomTransferDto>> GetAllRoomTransfersAsync()
    {
        var transfers = await _roomTransferRepository.GetAllRoomTransfersWithDetailsAsync();
        return transfers.Select(MapToDto);
    }

    public async Task<RoomTransferDto?> GetRoomTransferByIdAsync(int id)
    {
        var transfer = await _roomTransferRepository.GetRoomTransferWithDetailsAsync(id);
        return transfer != null ? MapToDto(transfer) : null;
    }

    public async Task<IEnumerable<RoomTransferDto>> GetRoomTransfersByAdmissionAsync(int admissionId)
    {
        var transfers = await _roomTransferRepository.GetRoomTransfersByAdmissionAsync(admissionId);
        return transfers.Select(MapToDto);
    }

    public async Task<IEnumerable<RoomTransferDto>> GetRoomTransfersByRoomAsync(int roomId)
    {
        var transfers = await _roomTransferRepository.GetRoomTransfersByRoomAsync(roomId);
        return transfers.Select(MapToDto);
    }

    public async Task<RoomTransferDto> CreateRoomTransferAsync(CreateRoomTransferDto createRoomTransferDto)
    {
        // Verify admission exists and is active
        var admission = await _admissionRepository.GetAdmissionWithDetailsAsync(createRoomTransferDto.AdmissionId);
        if (admission == null)
        {
            throw new ArgumentException("Admission not found");
        }

        if (admission.Status != "Admitted")
        {
            throw new InvalidOperationException("Can only transfer patients with active admissions");
        }

        // Verify rooms and beds exist
        var fromRoom = await _roomRepository.GetRoomWithDetailsAsync(admission.RoomId);
        var toRoom = await _roomRepository.GetRoomWithDetailsAsync(createRoomTransferDto.ToRoomId);
        var fromBed = await _bedRepository.GetBedWithDetailsAsync(admission.BedId);
        var toBed = await _bedRepository.GetBedWithDetailsAsync(createRoomTransferDto.ToBedId);

        if (fromRoom == null || toRoom == null || fromBed == null || toBed == null)
        {
            throw new ArgumentException("Room or bed not found");
        }

        // Verify to bed belongs to to room
        if (toBed.RoomId != createRoomTransferDto.ToRoomId)
        {
            throw new InvalidOperationException("Target bed does not belong to the target room");
        }

        // Check if target bed is available
        var activeBedAdmission = await _admissionRepository.GetActiveAdmissionByBedAsync(createRoomTransferDto.ToBedId);
        if (activeBedAdmission != null)
        {
            throw new InvalidOperationException("Target bed is already occupied");
        }

        // Verify doctor if provided
        if (createRoomTransferDto.TransferredByDoctorId.HasValue)
        {
            var doctor = await _doctorRepository.GetByIdAsync(createRoomTransferDto.TransferredByDoctorId.Value);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }
        }

        // Create transfer record
        var roomTransfer = new RoomTransfer
        {
            TransferDate = createRoomTransferDto.TransferDate,
            Reason = createRoomTransferDto.Reason,
            Notes = createRoomTransferDto.Notes,
            AdmissionId = createRoomTransferDto.AdmissionId,
            FromRoomId = admission.RoomId,
            ToRoomId = createRoomTransferDto.ToRoomId,
            FromBedId = admission.BedId,
            ToBedId = createRoomTransferDto.ToBedId,
            TransferredByDoctorId = createRoomTransferDto.TransferredByDoctorId,
            CreatedByUserId = createRoomTransferDto.CreatedByUserId
        };

        var createdTransfer = await _roomTransferRepository.AddAsync(roomTransfer);

        // Update admission
        admission.RoomId = createRoomTransferDto.ToRoomId;
        admission.BedId = createRoomTransferDto.ToBedId;
        admission.Status = "Transferred";
        admission.UpdatedAt = DateTime.UtcNow;
        await _admissionRepository.UpdateAsync(admission);

        // Free old bed
        fromBed.Status = "Available";
        fromBed.UpdatedAt = DateTime.UtcNow;
        await _bedRepository.UpdateAsync(fromBed);

        // Occupy new bed
        toBed.Status = "Occupied";
        toBed.UpdatedAt = DateTime.UtcNow;
        await _bedRepository.UpdateAsync(toBed);

        // Update old room status
        var fromRoomBeds = await _bedRepository.GetBedsByRoomAsync(fromRoom.Id);
        var fromRoomOccupiedBeds = fromRoomBeds.Count(b => b.Status == "Occupied" && b.IsActive);
        var fromRoomAvailableBeds = fromRoomBeds.Count(b => b.Status == "Available" && b.IsActive);

        if (fromRoomOccupiedBeds == 0)
        {
            fromRoom.Status = "Available";
        }
        else if (fromRoomAvailableBeds > 0)
        {
            fromRoom.Status = "Partially Occupied";
        }
        fromRoom.UpdatedAt = DateTime.UtcNow;
        await _roomRepository.UpdateAsync(fromRoom);

        // Update new room status
        var toRoomBeds = await _bedRepository.GetBedsByRoomAsync(toRoom.Id);
        var toRoomAvailableBeds = toRoomBeds.Count(b => b.Status == "Available" && b.IsActive);
        if (toRoomAvailableBeds == 0)
        {
            toRoom.Status = "Occupied";
        }
        else
        {
            toRoom.Status = "Partially Occupied";
        }
        toRoom.UpdatedAt = DateTime.UtcNow;
        await _roomRepository.UpdateAsync(toRoom);

        // Update admission status back to Admitted after transfer
        admission.Status = "Admitted";
        await _admissionRepository.UpdateAsync(admission);

        _logger.LogInformation("Created room transfer: {TransferId} for admission {AdmissionId}", createdTransfer.Id, createRoomTransferDto.AdmissionId);
        await _auditService.WriteAsync(createRoomTransferDto.CreatedByUserId?.ToString() ?? "system", "User", "Create", "RoomTransfer", createdTransfer.Id.ToString(), 
            $"Patient transferred from room {fromRoom.RoomNumber} bed {fromBed.BedNumber} to room {toRoom.RoomNumber} bed {toBed.BedNumber}");

        var transferWithDetails = await _roomTransferRepository.GetRoomTransferWithDetailsAsync(createdTransfer.Id);
        return MapToDto(transferWithDetails!);
    }

    public async Task DeleteRoomTransferAsync(int id)
    {
        var transfer = await _roomTransferRepository.GetRoomTransferWithDetailsAsync(id);
        if (transfer == null)
        {
            throw new ArgumentException("Room transfer not found");
        }

        await _roomTransferRepository.DeleteAsync(transfer);
        _logger.LogInformation("Deleted room transfer: {TransferId}", id);
    }

    private static RoomTransferDto MapToDto(RoomTransfer transfer)
    {
        return new RoomTransferDto
        {
            Id = transfer.Id,
            TransferDate = transfer.TransferDate,
            Reason = transfer.Reason,
            Notes = transfer.Notes,
            CreatedAt = transfer.CreatedAt,
            CreatedByUserId = transfer.CreatedByUserId,
            CreatedByUserName = transfer.CreatedBy != null 
                ? $"{transfer.CreatedBy.FirstName} {transfer.CreatedBy.LastName}" 
                : null,
            AdmissionId = transfer.AdmissionId,
            FromRoomId = transfer.FromRoomId,
            FromRoomNumber = transfer.FromRoom?.RoomNumber,
            ToRoomId = transfer.ToRoomId,
            ToRoomNumber = transfer.ToRoom?.RoomNumber,
            FromBedId = transfer.FromBedId,
            FromBedNumber = transfer.FromBed?.BedNumber,
            ToBedId = transfer.ToBedId,
            ToBedNumber = transfer.ToBed?.BedNumber,
            TransferredByDoctorId = transfer.TransferredByDoctorId,
            TransferredByDoctorName = transfer.TransferredByDoctor != null 
                ? $"{transfer.TransferredByDoctor.User.FirstName} {transfer.TransferredByDoctor.User.LastName}" 
                : null,
            PatientId = transfer.Admission?.PatientId,
            PatientName = transfer.Admission?.Patient != null 
                ? $"{transfer.Admission.Patient.User.FirstName} {transfer.Admission.Patient.User.LastName}" 
                : null
        };
    }
}

