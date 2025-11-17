using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class VitalSignsService : IVitalSignsService
{
    private readonly IVitalSignsRepository _vitalSignsRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IMedicalRecordRepository _medicalRecordRepository;
    private readonly ILogger<VitalSignsService> _logger;
    private readonly IAuditService _auditService;

    public VitalSignsService(
        IVitalSignsRepository vitalSignsRepository,
        IPatientRepository patientRepository,
        IMedicalRecordRepository medicalRecordRepository,
        ILogger<VitalSignsService> logger,
        IAuditService auditService)
    {
        _vitalSignsRepository = vitalSignsRepository;
        _patientRepository = patientRepository;
        _medicalRecordRepository = medicalRecordRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<VitalSignsDto>> GetAllVitalSignsAsync()
    {
        var vitalSigns = await _vitalSignsRepository.GetAllVitalSignsWithDetailsAsync();
        return vitalSigns.Select(MapToDto);
    }

    public async Task<VitalSignsDto?> GetVitalSignsByIdAsync(int id)
    {
        var vitalSigns = await _vitalSignsRepository.GetVitalSignsWithDetailsAsync(id);
        return vitalSigns != null ? MapToDto(vitalSigns) : null;
    }

    public async Task<IEnumerable<VitalSignsDto>> GetVitalSignsByPatientAsync(int patientId)
    {
        var vitalSigns = await _vitalSignsRepository.GetVitalSignsByPatientAsync(patientId);
        return vitalSigns.Select(MapToDto);
    }

    public async Task<IEnumerable<VitalSignsDto>> GetVitalSignsByPatientAndDateRangeAsync(int patientId, DateTime startDate, DateTime endDate)
    {
        var vitalSigns = await _vitalSignsRepository.GetVitalSignsByPatientAndDateRangeAsync(patientId, startDate, endDate);
        return vitalSigns.Select(MapToDto);
    }

    public async Task<VitalSignsDto> CreateVitalSignsAsync(CreateVitalSignsDto createVitalSignsDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createVitalSignsDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate medical record if provided
        if (createVitalSignsDto.MedicalRecordId.HasValue)
        {
            var medicalRecord = await _medicalRecordRepository.GetByIdAsync(createVitalSignsDto.MedicalRecordId.Value);
            if (medicalRecord == null)
            {
                throw new ArgumentException("Medical record not found");
            }
        }

        var vitalSigns = new VitalSigns
        {
            RecordedDate = createVitalSignsDto.RecordedDate,
            BloodPressureSystolic = createVitalSignsDto.BloodPressureSystolic,
            BloodPressureDiastolic = createVitalSignsDto.BloodPressureDiastolic,
            Temperature = createVitalSignsDto.Temperature,
            HeartRate = createVitalSignsDto.HeartRate,
            RespiratoryRate = createVitalSignsDto.RespiratoryRate,
            Weight = createVitalSignsDto.Weight,
            Height = createVitalSignsDto.Height,
            OxygenSaturation = createVitalSignsDto.OxygenSaturation,
            BloodGlucose = createVitalSignsDto.BloodGlucose,
            Notes = createVitalSignsDto.Notes,
            PatientId = createVitalSignsDto.PatientId,
            MedicalRecordId = createVitalSignsDto.MedicalRecordId,
            CreatedAt = DateTime.UtcNow
        };

        var createdVitalSigns = await _vitalSignsRepository.AddAsync(vitalSigns);
        await _auditService.WriteAsync("system", "Doctor", "Create", "VitalSigns", createdVitalSigns.Id.ToString(), $"PatientId={createdVitalSigns.PatientId}");
        var vitalSignsWithDetails = await _vitalSignsRepository.GetVitalSignsWithDetailsAsync(createdVitalSigns.Id);
        return MapToDto(vitalSignsWithDetails!);
    }

    public async Task UpdateVitalSignsAsync(int id, UpdateVitalSignsDto updateVitalSignsDto)
    {
        var vitalSigns = await _vitalSignsRepository.GetByIdAsync(id);
        if (vitalSigns == null)
        {
            throw new ArgumentException("Vital signs record not found");
        }

        if (updateVitalSignsDto.RecordedDate.HasValue)
            vitalSigns.RecordedDate = updateVitalSignsDto.RecordedDate.Value;
        if (updateVitalSignsDto.BloodPressureSystolic.HasValue)
            vitalSigns.BloodPressureSystolic = updateVitalSignsDto.BloodPressureSystolic;
        if (updateVitalSignsDto.BloodPressureDiastolic.HasValue)
            vitalSigns.BloodPressureDiastolic = updateVitalSignsDto.BloodPressureDiastolic;
        if (updateVitalSignsDto.Temperature.HasValue)
            vitalSigns.Temperature = updateVitalSignsDto.Temperature;
        if (updateVitalSignsDto.HeartRate.HasValue)
            vitalSigns.HeartRate = updateVitalSignsDto.HeartRate;
        if (updateVitalSignsDto.RespiratoryRate.HasValue)
            vitalSigns.RespiratoryRate = updateVitalSignsDto.RespiratoryRate;
        if (updateVitalSignsDto.Weight.HasValue)
            vitalSigns.Weight = updateVitalSignsDto.Weight;
        if (updateVitalSignsDto.Height.HasValue)
            vitalSigns.Height = updateVitalSignsDto.Height;
        if (updateVitalSignsDto.OxygenSaturation.HasValue)
            vitalSigns.OxygenSaturation = updateVitalSignsDto.OxygenSaturation;
        if (updateVitalSignsDto.BloodGlucose.HasValue)
            vitalSigns.BloodGlucose = updateVitalSignsDto.BloodGlucose;
        if (updateVitalSignsDto.Notes != null)
            vitalSigns.Notes = updateVitalSignsDto.Notes;
        if (updateVitalSignsDto.MedicalRecordId.HasValue)
            vitalSigns.MedicalRecordId = updateVitalSignsDto.MedicalRecordId;

        await _vitalSignsRepository.UpdateAsync(vitalSigns);
        await _auditService.WriteAsync("system", "Doctor", "Update", "VitalSigns", vitalSigns.Id.ToString(), "Updated fields");
    }

    public async Task DeleteVitalSignsAsync(int id)
    {
        var vitalSigns = await _vitalSignsRepository.GetByIdAsync(id);
        if (vitalSigns == null)
        {
            throw new ArgumentException("Vital signs record not found");
        }

        await _vitalSignsRepository.DeleteAsync(vitalSigns);
        await _auditService.WriteAsync("system", "Doctor", "Delete", "VitalSigns", vitalSigns.Id.ToString(), "Deleted");
    }

    private static VitalSignsDto MapToDto(VitalSigns vitalSigns) => new()
    {
        Id = vitalSigns.Id,
        RecordedDate = vitalSigns.RecordedDate,
        BloodPressureSystolic = vitalSigns.BloodPressureSystolic,
        BloodPressureDiastolic = vitalSigns.BloodPressureDiastolic,
        Temperature = vitalSigns.Temperature,
        HeartRate = vitalSigns.HeartRate,
        RespiratoryRate = vitalSigns.RespiratoryRate,
        Weight = vitalSigns.Weight,
        Height = vitalSigns.Height,
        OxygenSaturation = vitalSigns.OxygenSaturation,
        BloodGlucose = vitalSigns.BloodGlucose,
        Notes = vitalSigns.Notes,
        CreatedAt = vitalSigns.CreatedAt,
        PatientId = vitalSigns.PatientId,
        PatientName = $"{vitalSigns.Patient?.User?.FirstName} {vitalSigns.Patient?.User?.LastName}".Trim(),
        MedicalRecordId = vitalSigns.MedicalRecordId,
        RecordedByUserId = vitalSigns.RecordedByUserId,
        RecordedByName = vitalSigns.RecordedBy != null 
            ? $"{vitalSigns.RecordedBy.FirstName} {vitalSigns.RecordedBy.LastName}".Trim()
            : null
    };
}

