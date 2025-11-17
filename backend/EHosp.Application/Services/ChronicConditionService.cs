using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class ChronicConditionService : IChronicConditionService
{
    private readonly IChronicConditionRepository _chronicConditionRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ChronicConditionService> _logger;
    private readonly IAuditService _auditService;

    public ChronicConditionService(
        IChronicConditionRepository chronicConditionRepository,
        IPatientRepository patientRepository,
        IDoctorRepository doctorRepository,
        IUserRepository userRepository,
        ILogger<ChronicConditionService> logger,
        IAuditService auditService)
    {
        _chronicConditionRepository = chronicConditionRepository;
        _patientRepository = patientRepository;
        _doctorRepository = doctorRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<ChronicConditionDto>> GetAllChronicConditionsAsync()
    {
        var conditions = await _chronicConditionRepository.GetAllChronicConditionsWithDetailsAsync();
        return conditions.Select(MapToDto);
    }

    public async Task<ChronicConditionDto?> GetChronicConditionByIdAsync(int id)
    {
        var condition = await _chronicConditionRepository.GetChronicConditionWithDetailsAsync(id);
        return condition != null ? MapToDto(condition) : null;
    }

    public async Task<IEnumerable<ChronicConditionDto>> GetChronicConditionsByPatientAsync(int patientId)
    {
        var conditions = await _chronicConditionRepository.GetChronicConditionsByPatientAsync(patientId);
        return conditions.Select(MapToDto);
    }

    public async Task<IEnumerable<ChronicConditionDto>> GetActiveChronicConditionsByPatientAsync(int patientId)
    {
        var conditions = await _chronicConditionRepository.GetActiveChronicConditionsByPatientAsync(patientId);
        return conditions.Select(MapToDto);
    }

    public async Task<ChronicConditionDto> CreateChronicConditionAsync(CreateChronicConditionDto createChronicConditionDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createChronicConditionDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate doctor if provided
        if (createChronicConditionDto.DiagnosedByDoctorId.HasValue)
        {
            var doctor = await _doctorRepository.GetByIdAsync(createChronicConditionDto.DiagnosedByDoctorId.Value);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }
        }

        // Validate user if provided
        if (createChronicConditionDto.RecordedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createChronicConditionDto.RecordedByUserId.Value);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        var condition = new ChronicCondition
        {
            ConditionName = createChronicConditionDto.ConditionName,
            Category = createChronicConditionDto.Category,
            DiagnosisDate = createChronicConditionDto.DiagnosisDate,
            Status = createChronicConditionDto.Status,
            Treatment = createChronicConditionDto.Treatment,
            Notes = createChronicConditionDto.Notes,
            IsActive = createChronicConditionDto.IsActive,
            PatientId = createChronicConditionDto.PatientId,
            DiagnosedByDoctorId = createChronicConditionDto.DiagnosedByDoctorId,
            RecordedByUserId = createChronicConditionDto.RecordedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        var createdCondition = await _chronicConditionRepository.AddAsync(condition);
        await _auditService.WriteAsync(
            createChronicConditionDto.RecordedByUserId?.ToString() ?? "system",
            "Admin",
            "Create",
            "ChronicCondition",
            createdCondition.Id.ToString(),
            $"PatientId={createdCondition.PatientId}, ConditionName={createdCondition.ConditionName}"
        );

        var conditionWithDetails = await _chronicConditionRepository.GetChronicConditionWithDetailsAsync(createdCondition.Id);
        return MapToDto(conditionWithDetails!);
    }

    public async Task UpdateChronicConditionAsync(int id, UpdateChronicConditionDto updateChronicConditionDto)
    {
        var condition = await _chronicConditionRepository.GetByIdAsync(id);
        if (condition == null)
        {
            throw new ArgumentException("Chronic condition not found");
        }

        if (!string.IsNullOrEmpty(updateChronicConditionDto.ConditionName))
            condition.ConditionName = updateChronicConditionDto.ConditionName;
        if (updateChronicConditionDto.Category != null)
            condition.Category = updateChronicConditionDto.Category;
        if (updateChronicConditionDto.DiagnosisDate.HasValue)
            condition.DiagnosisDate = updateChronicConditionDto.DiagnosisDate;
        if (updateChronicConditionDto.Status != null)
            condition.Status = updateChronicConditionDto.Status;
        if (updateChronicConditionDto.Treatment != null)
            condition.Treatment = updateChronicConditionDto.Treatment;
        if (updateChronicConditionDto.Notes != null)
            condition.Notes = updateChronicConditionDto.Notes;
        if (updateChronicConditionDto.IsActive.HasValue)
            condition.IsActive = updateChronicConditionDto.IsActive.Value;
        if (updateChronicConditionDto.DiagnosedByDoctorId.HasValue)
            condition.DiagnosedByDoctorId = updateChronicConditionDto.DiagnosedByDoctorId;

        condition.UpdatedAt = DateTime.UtcNow;

        await _chronicConditionRepository.UpdateAsync(condition);
        await _auditService.WriteAsync("system", "Admin", "Update", "ChronicCondition", condition.Id.ToString(), "Updated fields");
    }

    public async Task DeleteChronicConditionAsync(int id)
    {
        var condition = await _chronicConditionRepository.GetByIdAsync(id);
        if (condition == null)
        {
            throw new ArgumentException("Chronic condition not found");
        }

        await _chronicConditionRepository.DeleteAsync(condition);
        await _auditService.WriteAsync("system", "Admin", "Delete", "ChronicCondition", condition.Id.ToString(), "Deleted");
    }

    private static ChronicConditionDto MapToDto(ChronicCondition condition) => new()
    {
        Id = condition.Id,
        ConditionName = condition.ConditionName,
        Category = condition.Category,
        DiagnosisDate = condition.DiagnosisDate,
        Status = condition.Status,
        Treatment = condition.Treatment,
        Notes = condition.Notes,
        IsActive = condition.IsActive,
        CreatedAt = condition.CreatedAt,
        UpdatedAt = condition.UpdatedAt,
        PatientId = condition.PatientId,
        PatientName = $"{condition.Patient?.User?.FirstName} {condition.Patient?.User?.LastName}".Trim(),
        DiagnosedByDoctorId = condition.DiagnosedByDoctorId,
        DiagnosedByDoctorName = condition.DiagnosedByDoctor != null
            ? $"{condition.DiagnosedByDoctor.User?.FirstName} {condition.DiagnosedByDoctor.User?.LastName}".Trim()
            : null,
        RecordedByUserId = condition.RecordedByUserId,
        RecordedByUserName = condition.RecordedByUser != null
            ? $"{condition.RecordedByUser.FirstName} {condition.RecordedByUser.LastName}".Trim()
            : null
    };
}

