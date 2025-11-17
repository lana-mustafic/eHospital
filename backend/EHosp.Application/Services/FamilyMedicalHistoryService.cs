using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class FamilyMedicalHistoryService : IFamilyMedicalHistoryService
{
    private readonly IFamilyMedicalHistoryRepository _familyMedicalHistoryRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<FamilyMedicalHistoryService> _logger;
    private readonly IAuditService _auditService;

    public FamilyMedicalHistoryService(
        IFamilyMedicalHistoryRepository familyMedicalHistoryRepository,
        IPatientRepository patientRepository,
        IUserRepository userRepository,
        ILogger<FamilyMedicalHistoryService> logger,
        IAuditService auditService)
    {
        _familyMedicalHistoryRepository = familyMedicalHistoryRepository;
        _patientRepository = patientRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<FamilyMedicalHistoryDto>> GetAllFamilyMedicalHistoriesAsync()
    {
        var histories = await _familyMedicalHistoryRepository.GetAllFamilyMedicalHistoriesWithDetailsAsync();
        return histories.Select(MapToDto);
    }

    public async Task<FamilyMedicalHistoryDto?> GetFamilyMedicalHistoryByIdAsync(int id)
    {
        var history = await _familyMedicalHistoryRepository.GetFamilyMedicalHistoryWithDetailsAsync(id);
        return history != null ? MapToDto(history) : null;
    }

    public async Task<IEnumerable<FamilyMedicalHistoryDto>> GetFamilyMedicalHistoriesByPatientAsync(int patientId)
    {
        var histories = await _familyMedicalHistoryRepository.GetFamilyMedicalHistoriesByPatientAsync(patientId);
        return histories.Select(MapToDto);
    }

    public async Task<FamilyMedicalHistoryDto> CreateFamilyMedicalHistoryAsync(CreateFamilyMedicalHistoryDto createFamilyMedicalHistoryDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createFamilyMedicalHistoryDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate user if provided
        if (createFamilyMedicalHistoryDto.RecordedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createFamilyMedicalHistoryDto.RecordedByUserId.Value);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        var history = new FamilyMedicalHistory
        {
            Relationship = createFamilyMedicalHistoryDto.Relationship,
            ConditionName = createFamilyMedicalHistoryDto.ConditionName,
            Category = createFamilyMedicalHistoryDto.Category,
            AgeOfOnset = createFamilyMedicalHistoryDto.AgeOfOnset,
            Status = createFamilyMedicalHistoryDto.Status,
            Notes = createFamilyMedicalHistoryDto.Notes,
            PatientId = createFamilyMedicalHistoryDto.PatientId,
            RecordedByUserId = createFamilyMedicalHistoryDto.RecordedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        var createdHistory = await _familyMedicalHistoryRepository.AddAsync(history);
        await _auditService.WriteAsync(
            createFamilyMedicalHistoryDto.RecordedByUserId?.ToString() ?? "system",
            "Admin",
            "Create",
            "FamilyMedicalHistory",
            createdHistory.Id.ToString(),
            $"PatientId={createdHistory.PatientId}, Relationship={createdHistory.Relationship}, ConditionName={createdHistory.ConditionName}"
        );

        var historyWithDetails = await _familyMedicalHistoryRepository.GetFamilyMedicalHistoryWithDetailsAsync(createdHistory.Id);
        return MapToDto(historyWithDetails!);
    }

    public async Task UpdateFamilyMedicalHistoryAsync(int id, UpdateFamilyMedicalHistoryDto updateFamilyMedicalHistoryDto)
    {
        var history = await _familyMedicalHistoryRepository.GetByIdAsync(id);
        if (history == null)
        {
            throw new ArgumentException("Family medical history not found");
        }

        if (!string.IsNullOrEmpty(updateFamilyMedicalHistoryDto.Relationship))
            history.Relationship = updateFamilyMedicalHistoryDto.Relationship;
        if (!string.IsNullOrEmpty(updateFamilyMedicalHistoryDto.ConditionName))
            history.ConditionName = updateFamilyMedicalHistoryDto.ConditionName;
        if (updateFamilyMedicalHistoryDto.Category != null)
            history.Category = updateFamilyMedicalHistoryDto.Category;
        if (updateFamilyMedicalHistoryDto.AgeOfOnset != null)
            history.AgeOfOnset = updateFamilyMedicalHistoryDto.AgeOfOnset;
        if (updateFamilyMedicalHistoryDto.Status != null)
            history.Status = updateFamilyMedicalHistoryDto.Status;
        if (updateFamilyMedicalHistoryDto.Notes != null)
            history.Notes = updateFamilyMedicalHistoryDto.Notes;

        history.UpdatedAt = DateTime.UtcNow;

        await _familyMedicalHistoryRepository.UpdateAsync(history);
        await _auditService.WriteAsync("system", "Admin", "Update", "FamilyMedicalHistory", history.Id.ToString(), "Updated fields");
    }

    public async Task DeleteFamilyMedicalHistoryAsync(int id)
    {
        var history = await _familyMedicalHistoryRepository.GetByIdAsync(id);
        if (history == null)
        {
            throw new ArgumentException("Family medical history not found");
        }

        await _familyMedicalHistoryRepository.DeleteAsync(history);
        await _auditService.WriteAsync("system", "Admin", "Delete", "FamilyMedicalHistory", history.Id.ToString(), "Deleted");
    }

    private static FamilyMedicalHistoryDto MapToDto(FamilyMedicalHistory history) => new()
    {
        Id = history.Id,
        Relationship = history.Relationship,
        ConditionName = history.ConditionName,
        Category = history.Category,
        AgeOfOnset = history.AgeOfOnset,
        Status = history.Status,
        Notes = history.Notes,
        CreatedAt = history.CreatedAt,
        UpdatedAt = history.UpdatedAt,
        PatientId = history.PatientId,
        PatientName = $"{history.Patient?.User?.FirstName} {history.Patient?.User?.LastName}".Trim(),
        RecordedByUserId = history.RecordedByUserId,
        RecordedByUserName = history.RecordedByUser != null
            ? $"{history.RecordedByUser.FirstName} {history.RecordedByUser.LastName}".Trim()
            : null
    };
}

