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
    private readonly INotificationService _notificationService;
    private readonly ILogger<VitalSignsService> _logger;
    private readonly IAuditService _auditService;

    public VitalSignsService(
        IVitalSignsRepository vitalSignsRepository,
        IPatientRepository patientRepository,
        IMedicalRecordRepository medicalRecordRepository,
        INotificationService notificationService,
        ILogger<VitalSignsService> logger,
        IAuditService auditService)
    {
        _vitalSignsRepository = vitalSignsRepository;
        _patientRepository = patientRepository;
        _medicalRecordRepository = medicalRecordRepository;
        _notificationService = notificationService;
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
        
        // Check for critical vital signs and send alerts
        await CheckCriticalVitalSignsAsync(createdVitalSigns);
        
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

    private async Task CheckCriticalVitalSignsAsync(VitalSigns vitalSigns)
    {
        var patient = await _patientRepository.GetPatientWithDetailsAsync(vitalSigns.PatientId);
        if (patient == null) return;

        var alerts = new List<string>();
        var isCritical = false;

        // Check blood pressure (systolic > 180 or < 90, diastolic > 120 or < 60)
        if (vitalSigns.BloodPressureSystolic.HasValue)
        {
            if (vitalSigns.BloodPressureSystolic > 180 || vitalSigns.BloodPressureSystolic < 90)
            {
                alerts.Add($"Critical Blood Pressure: {vitalSigns.BloodPressureSystolic}/{vitalSigns.BloodPressureDiastolic} mmHg");
                isCritical = true;
            }
        }

        // Check temperature (> 38.5°C or < 35°C)
        if (vitalSigns.Temperature.HasValue)
        {
            if (vitalSigns.Temperature > 38.5m || vitalSigns.Temperature < 35m)
            {
                alerts.Add($"Critical Temperature: {vitalSigns.Temperature}°C");
                isCritical = true;
            }
        }

        // Check heart rate (> 120 or < 50 bpm)
        if (vitalSigns.HeartRate.HasValue)
        {
            if (vitalSigns.HeartRate > 120 || vitalSigns.HeartRate < 50)
            {
                alerts.Add($"Critical Heart Rate: {vitalSigns.HeartRate} bpm");
                isCritical = true;
            }
        }

        // Check oxygen saturation (< 90%)
        if (vitalSigns.OxygenSaturation.HasValue)
        {
            if (vitalSigns.OxygenSaturation < 90)
            {
                alerts.Add($"Critical Oxygen Saturation: {vitalSigns.OxygenSaturation}%");
                isCritical = true;
            }
        }

        // Check blood glucose (> 250 or < 70 mg/dL)
        if (vitalSigns.BloodGlucose.HasValue)
        {
            if (vitalSigns.BloodGlucose > 250 || vitalSigns.BloodGlucose < 70)
            {
                alerts.Add($"Critical Blood Glucose: {vitalSigns.BloodGlucose} mg/dL");
                isCritical = true;
            }
        }

        // Send alerts if critical values found
        if (alerts.Any() && isCritical)
        {
            var patientName = $"{patient.User?.FirstName} {patient.User?.LastName}";
            var message = $"Patient {patientName} has critical vital signs:\n" + string.Join("\n", alerts);
            
            // Notify patient's doctor if available
            if (vitalSigns.MedicalRecordId.HasValue)
            {
                var medicalRecord = await _medicalRecordRepository.GetMedicalRecordWithDetailsAsync(vitalSigns.MedicalRecordId.Value);
                if (medicalRecord != null && medicalRecord.Doctor != null)
                {
                    await _notificationService.SendCriticalAlertAsync(
                        medicalRecord.Doctor.UserId,
                        "Critical Vital Signs Alert",
                        message,
                        "VitalSigns",
                        "VitalSigns",
                        vitalSigns.Id
                    );
                }
            }

            // Also notify patient
            if (patient.UserId > 0)
            {
                await _notificationService.SendCriticalAlertAsync(
                    patient.UserId,
                    "Critical Vital Signs Alert",
                    $"Your recent vital signs require immediate attention. Please contact your healthcare provider.",
                    "VitalSigns",
                    "VitalSigns",
                    vitalSigns.Id
                );
            }
        }
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

