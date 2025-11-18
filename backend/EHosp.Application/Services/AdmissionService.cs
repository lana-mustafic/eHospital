using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class AdmissionService : IAdmissionService
{
    private readonly IAdmissionRepository _admissionRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IBedRepository _bedRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly ILogger<AdmissionService> _logger;
    private readonly IAuditService _auditService;

    public AdmissionService(
        IAdmissionRepository admissionRepository,
        IPatientRepository patientRepository,
        IRoomRepository roomRepository,
        IBedRepository bedRepository,
        IDoctorRepository doctorRepository,
        ILogger<AdmissionService> logger,
        IAuditService auditService)
    {
        _admissionRepository = admissionRepository;
        _patientRepository = patientRepository;
        _roomRepository = roomRepository;
        _bedRepository = bedRepository;
        _doctorRepository = doctorRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<AdmissionDto>> GetAllAdmissionsAsync()
    {
        var admissions = await _admissionRepository.GetAllAdmissionsWithDetailsAsync();
        return admissions.Select(MapToDto);
    }

    public async Task<AdmissionDto?> GetAdmissionByIdAsync(int id)
    {
        var admission = await _admissionRepository.GetAdmissionWithDetailsAsync(id);
        return admission != null ? MapToDto(admission) : null;
    }

    public async Task<IEnumerable<AdmissionDto>> GetAdmissionsByPatientAsync(int patientId)
    {
        var admissions = await _admissionRepository.GetAdmissionsByPatientAsync(patientId);
        return admissions.Select(MapToDto);
    }

    public async Task<IEnumerable<AdmissionDto>> GetAdmissionsByStatusAsync(string status)
    {
        var admissions = await _admissionRepository.GetAdmissionsByStatusAsync(status);
        return admissions.Select(MapToDto);
    }

    public async Task<IEnumerable<AdmissionDto>> GetActiveAdmissionsAsync()
    {
        var admissions = await _admissionRepository.GetActiveAdmissionsAsync();
        return admissions.Select(MapToDto);
    }

    public async Task<IEnumerable<AdmissionDto>> GetAdmissionsByRoomAsync(int roomId)
    {
        var admissions = await _admissionRepository.GetAdmissionsByRoomAsync(roomId);
        return admissions.Select(MapToDto);
    }

    public async Task<IEnumerable<AdmissionDto>> GetAdmissionsByBedAsync(int bedId)
    {
        var admissions = await _admissionRepository.GetAdmissionsByBedAsync(bedId);
        return admissions.Select(MapToDto);
    }

    public async Task<AdmissionDto?> GetActiveAdmissionByPatientAsync(int patientId)
    {
        var admission = await _admissionRepository.GetActiveAdmissionByPatientAsync(patientId);
        return admission != null ? MapToDto(admission) : null;
    }

    public async Task<AdmissionDto> CreateAdmissionAsync(CreateAdmissionDto createAdmissionDto)
    {
        // Verify patient exists
        var patient = await _patientRepository.GetByIdAsync(createAdmissionDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Check if patient already has an active admission
        var activeAdmission = await _admissionRepository.GetActiveAdmissionByPatientAsync(createAdmissionDto.PatientId);
        if (activeAdmission != null)
        {
            throw new InvalidOperationException("Patient already has an active admission. Please discharge or transfer first.");
        }

        // Verify room and bed exist
        var room = await _roomRepository.GetRoomWithDetailsAsync(createAdmissionDto.RoomId);
        if (room == null)
        {
            throw new ArgumentException("Room not found");
        }

        var bed = await _bedRepository.GetBedWithDetailsAsync(createAdmissionDto.BedId);
        if (bed == null)
        {
            throw new ArgumentException("Bed not found");
        }

        // Verify bed belongs to room
        if (bed.RoomId != createAdmissionDto.RoomId)
        {
            throw new InvalidOperationException("Bed does not belong to the specified room");
        }

        // Check if bed is available
        var activeBedAdmission = await _admissionRepository.GetActiveAdmissionByBedAsync(createAdmissionDto.BedId);
        if (activeBedAdmission != null)
        {
            throw new InvalidOperationException("Bed is already occupied");
        }

        // Verify doctor if provided
        if (createAdmissionDto.AdmittingDoctorId.HasValue)
        {
            var doctor = await _doctorRepository.GetByIdAsync(createAdmissionDto.AdmittingDoctorId.Value);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }
        }

        var admission = new Admission
        {
            AdmissionDate = createAdmissionDto.AdmissionDate,
            Status = "Admitted",
            ReasonForAdmission = createAdmissionDto.ReasonForAdmission,
            Diagnosis = createAdmissionDto.Diagnosis,
            Notes = createAdmissionDto.Notes,
            PatientId = createAdmissionDto.PatientId,
            RoomId = createAdmissionDto.RoomId,
            BedId = createAdmissionDto.BedId,
            AdmittingDoctorId = createAdmissionDto.AdmittingDoctorId,
            CreatedByUserId = createAdmissionDto.CreatedByUserId
        };

        var createdAdmission = await _admissionRepository.AddAsync(admission);

        // Update bed and room status
        bed.Status = "Occupied";
        bed.UpdatedAt = DateTime.UtcNow;
        await _bedRepository.UpdateAsync(bed);

        // Update room status if all beds are occupied
        var roomBeds = await _bedRepository.GetBedsByRoomAsync(room.Id);
        var availableBeds = roomBeds.Count(b => b.Status == "Available" && b.IsActive);
        if (availableBeds == 0)
        {
            room.Status = "Occupied";
            room.UpdatedAt = DateTime.UtcNow;
            await _roomRepository.UpdateAsync(room);
        }
        else if (room.Status == "Available")
        {
            room.Status = "Partially Occupied";
            room.UpdatedAt = DateTime.UtcNow;
            await _roomRepository.UpdateAsync(room);
        }

        _logger.LogInformation("Created admission: {AdmissionId} for patient {PatientId}", createdAdmission.Id, createAdmissionDto.PatientId);
        await _auditService.WriteAsync(createAdmissionDto.CreatedByUserId?.ToString() ?? "system", "User", "Create", "Admission", createdAdmission.Id.ToString(), $"Patient {patient.User.FirstName} {patient.User.LastName} admitted to room {room.RoomNumber}, bed {bed.BedNumber}");

        var admissionWithDetails = await _admissionRepository.GetAdmissionWithDetailsAsync(createdAdmission.Id);
        return MapToDto(admissionWithDetails!);
    }

    public async Task UpdateAdmissionAsync(int id, UpdateAdmissionDto updateAdmissionDto)
    {
        var admission = await _admissionRepository.GetAdmissionWithDetailsAsync(id);
        if (admission == null)
        {
            throw new ArgumentException("Admission not found");
        }

        if (updateAdmissionDto.AdmissionDate.HasValue)
            admission.AdmissionDate = updateAdmissionDto.AdmissionDate.Value;
        if (!string.IsNullOrEmpty(updateAdmissionDto.ReasonForAdmission))
            admission.ReasonForAdmission = updateAdmissionDto.ReasonForAdmission;
        if (updateAdmissionDto.Diagnosis != null)
            admission.Diagnosis = updateAdmissionDto.Diagnosis;
        if (updateAdmissionDto.Notes != null)
            admission.Notes = updateAdmissionDto.Notes;
        if (updateAdmissionDto.AdmittingDoctorId.HasValue)
        {
            var doctor = await _doctorRepository.GetByIdAsync(updateAdmissionDto.AdmittingDoctorId.Value);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }
            admission.AdmittingDoctorId = updateAdmissionDto.AdmittingDoctorId;
        }
        if (updateAdmissionDto.DischargingDoctorId.HasValue)
        {
            var doctor = await _doctorRepository.GetByIdAsync(updateAdmissionDto.DischargingDoctorId.Value);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }
            admission.DischargingDoctorId = updateAdmissionDto.DischargingDoctorId;
        }

        // Handle room/bed transfer
        if (updateAdmissionDto.RoomId.HasValue || updateAdmissionDto.BedId.HasValue)
        {
            var newRoomId = updateAdmissionDto.RoomId ?? admission.RoomId;
            var newBedId = updateAdmissionDto.BedId ?? admission.BedId;

            if (newRoomId != admission.RoomId || newBedId != admission.BedId)
            {
                // This should be done through RoomTransferService, but we'll handle basic update here
                var oldBed = await _bedRepository.GetByIdAsync(admission.BedId);
                var newBed = await _bedRepository.GetBedWithDetailsAsync(newBedId);
                
                if (newBed == null)
                {
                    throw new ArgumentException("New bed not found");
                }

                if (newBed.RoomId != newRoomId)
                {
                    throw new InvalidOperationException("New bed does not belong to the specified room");
                }

                // Free old bed
                if (oldBed != null)
                {
                    oldBed.Status = "Available";
                    oldBed.UpdatedAt = DateTime.UtcNow;
                    await _bedRepository.UpdateAsync(oldBed);
                }

                // Occupy new bed
                newBed.Status = "Occupied";
                newBed.UpdatedAt = DateTime.UtcNow;
                await _bedRepository.UpdateAsync(newBed);

                admission.RoomId = newRoomId;
                admission.BedId = newBedId;
            }
        }

        admission.UpdatedAt = DateTime.UtcNow;
        await _admissionRepository.UpdateAsync(admission);
        _logger.LogInformation("Updated admission: {AdmissionId}", id);
    }

    public async Task DischargePatientAsync(int id, DischargePatientDto dischargeDto)
    {
        var admission = await _admissionRepository.GetAdmissionWithDetailsAsync(id);
        if (admission == null)
        {
            throw new ArgumentException("Admission not found");
        }

        if (admission.Status != "Admitted")
        {
            throw new InvalidOperationException("Only admitted patients can be discharged");
        }

        // Verify discharging doctor
        var doctor = await _doctorRepository.GetByIdAsync(dischargeDto.DischargingDoctorId);
        if (doctor == null)
        {
            throw new ArgumentException("Doctor not found");
        }

        admission.DischargeDate = dischargeDto.DischargeDate;
        admission.Status = "Discharged";
        admission.DischargingDoctorId = dischargeDto.DischargingDoctorId;
        if (!string.IsNullOrEmpty(dischargeDto.DischargeNotes))
        {
            admission.Notes = string.IsNullOrEmpty(admission.Notes) 
                ? dischargeDto.DischargeNotes 
                : $"{admission.Notes}\n\nDischarge Notes: {dischargeDto.DischargeNotes}";
        }
        admission.UpdatedAt = DateTime.UtcNow;

        await _admissionRepository.UpdateAsync(admission);

        // Free the bed
        var bed = await _bedRepository.GetByIdAsync(admission.BedId);
        if (bed != null)
        {
            bed.Status = "Available";
            bed.UpdatedAt = DateTime.UtcNow;
            await _bedRepository.UpdateAsync(bed);
        }

        // Update room status
        var room = await _roomRepository.GetRoomWithDetailsAsync(admission.RoomId);
        if (room != null)
        {
            var roomBeds = await _bedRepository.GetBedsByRoomAsync(room.Id);
            var occupiedBeds = roomBeds.Count(b => b.Status == "Occupied" && b.IsActive);
            var availableBeds = roomBeds.Count(b => b.Status == "Available" && b.IsActive);

            if (occupiedBeds == 0)
            {
                room.Status = "Available";
            }
            else if (availableBeds > 0)
            {
                room.Status = "Partially Occupied";
            }

            room.UpdatedAt = DateTime.UtcNow;
            await _roomRepository.UpdateAsync(room);
        }

        _logger.LogInformation("Discharged patient from admission: {AdmissionId}", id);
        await _auditService.WriteAsync(dischargeDto.DischargingDoctorId.ToString(), "Doctor", "Discharge", "Admission", id.ToString(), $"Patient discharged from room {room?.RoomNumber}, bed {bed?.BedNumber}");

        await _admissionRepository.UpdateAsync(admission);
    }

    public async Task DeleteAdmissionAsync(int id)
    {
        var admission = await _admissionRepository.GetAdmissionWithDetailsAsync(id);
        if (admission == null)
        {
            throw new ArgumentException("Admission not found");
        }

        if (admission.Status == "Admitted")
        {
            throw new InvalidOperationException("Cannot delete active admission. Please discharge the patient first.");
        }

        await _admissionRepository.DeleteAsync(admission);
        _logger.LogInformation("Deleted admission: {AdmissionId}", id);
    }

    private static AdmissionDto MapToDto(Admission admission)
    {
        var lengthOfStay = admission.DischargeDate.HasValue
            ? (int)(admission.DischargeDate.Value - admission.AdmissionDate).TotalDays
            : (int)(DateTime.UtcNow - admission.AdmissionDate).TotalDays;

        return new AdmissionDto
        {
            Id = admission.Id,
            AdmissionDate = admission.AdmissionDate,
            DischargeDate = admission.DischargeDate,
            Status = admission.Status,
            ReasonForAdmission = admission.ReasonForAdmission,
            Diagnosis = admission.Diagnosis,
            Notes = admission.Notes,
            CreatedAt = admission.CreatedAt,
            UpdatedAt = admission.UpdatedAt,
            PatientId = admission.PatientId,
            PatientName = $"{admission.Patient.User.FirstName} {admission.Patient.User.LastName}",
            RoomId = admission.RoomId,
            RoomNumber = admission.Room?.RoomNumber,
            BedId = admission.BedId,
            BedNumber = admission.Bed?.BedNumber,
            AdmittingDoctorId = admission.AdmittingDoctorId,
            AdmittingDoctorName = admission.AdmittingDoctor != null 
                ? $"{admission.AdmittingDoctor.User.FirstName} {admission.AdmittingDoctor.User.LastName}" 
                : null,
            DischargingDoctorId = admission.DischargingDoctorId,
            DischargingDoctorName = admission.DischargingDoctor != null 
                ? $"{admission.DischargingDoctor.User.FirstName} {admission.DischargingDoctor.User.LastName}" 
                : null,
            CreatedByUserId = admission.CreatedByUserId,
            CreatedByUserName = admission.CreatedBy != null 
                ? $"{admission.CreatedBy.FirstName} {admission.CreatedBy.LastName}" 
                : null,
            LengthOfStay = lengthOfStay,
            RoomTransfers = admission.RoomTransfers?.Select(rt => new RoomTransferDto
            {
                Id = rt.Id,
                TransferDate = rt.TransferDate,
                Reason = rt.Reason,
                Notes = rt.Notes,
                CreatedAt = rt.CreatedAt,
                CreatedByUserId = rt.CreatedByUserId,
                CreatedByUserName = rt.CreatedBy != null 
                    ? $"{rt.CreatedBy.FirstName} {rt.CreatedBy.LastName}" 
                    : null,
                AdmissionId = rt.AdmissionId,
                FromRoomId = rt.FromRoomId,
                FromRoomNumber = rt.FromRoom?.RoomNumber,
                ToRoomId = rt.ToRoomId,
                ToRoomNumber = rt.ToRoom?.RoomNumber,
                FromBedId = rt.FromBedId,
                FromBedNumber = rt.FromBed?.BedNumber,
                ToBedId = rt.ToBedId,
                ToBedNumber = rt.ToBed?.BedNumber,
                TransferredByDoctorId = rt.TransferredByDoctorId,
                TransferredByDoctorName = rt.TransferredByDoctor != null 
                    ? $"{rt.TransferredByDoctor.User.FirstName} {rt.TransferredByDoctor.User.LastName}" 
                    : null,
                PatientId = rt.Admission?.PatientId,
                PatientName = rt.Admission?.Patient != null 
                    ? $"{rt.Admission.Patient.User.FirstName} {rt.Admission.Patient.User.LastName}" 
                    : null
            }).ToList() ?? new List<RoomTransferDto>()
        };
    }
}

