using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class PatientAllergyService : IPatientAllergyService
{
    private readonly IPatientAllergyRepository _patientAllergyRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<PatientAllergyService> _logger;
    private readonly IAuditService _auditService;

    public PatientAllergyService(
        IPatientAllergyRepository patientAllergyRepository,
        IPatientRepository patientRepository,
        IUserRepository userRepository,
        ILogger<PatientAllergyService> logger,
        IAuditService auditService)
    {
        _patientAllergyRepository = patientAllergyRepository;
        _patientRepository = patientRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<PatientAllergyDto>> GetAllPatientAllergiesAsync()
    {
        var allergies = await _patientAllergyRepository.GetAllPatientAllergiesWithDetailsAsync();
        return allergies.Select(MapToDto);
    }

    public async Task<PatientAllergyDto?> GetPatientAllergyByIdAsync(int id)
    {
        var allergy = await _patientAllergyRepository.GetPatientAllergyWithDetailsAsync(id);
        return allergy != null ? MapToDto(allergy) : null;
    }

    public async Task<IEnumerable<PatientAllergyDto>> GetPatientAllergiesByPatientAsync(int patientId)
    {
        var allergies = await _patientAllergyRepository.GetPatientAllergiesByPatientAsync(patientId);
        return allergies.Select(MapToDto);
    }

    public async Task<IEnumerable<PatientAllergyDto>> GetActivePatientAllergiesByPatientAsync(int patientId)
    {
        var allergies = await _patientAllergyRepository.GetActivePatientAllergiesByPatientAsync(patientId);
        return allergies.Select(MapToDto);
    }

    public async Task<PatientAllergyDto> CreatePatientAllergyAsync(CreatePatientAllergyDto createPatientAllergyDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createPatientAllergyDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate user if provided
        if (createPatientAllergyDto.RecordedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createPatientAllergyDto.RecordedByUserId.Value);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        var allergy = new PatientAllergy
        {
            AllergenName = createPatientAllergyDto.AllergenName,
            AllergyType = createPatientAllergyDto.AllergyType,
            Severity = createPatientAllergyDto.Severity,
            Reaction = createPatientAllergyDto.Reaction,
            OnsetDate = createPatientAllergyDto.OnsetDate,
            Notes = createPatientAllergyDto.Notes,
            IsActive = createPatientAllergyDto.IsActive,
            PatientId = createPatientAllergyDto.PatientId,
            RecordedByUserId = createPatientAllergyDto.RecordedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        var createdAllergy = await _patientAllergyRepository.AddAsync(allergy);
        await _auditService.WriteAsync(
            createPatientAllergyDto.RecordedByUserId?.ToString() ?? "system",
            "Admin",
            "Create",
            "PatientAllergy",
            createdAllergy.Id.ToString(),
            $"PatientId={createdAllergy.PatientId}, AllergenName={createdAllergy.AllergenName}"
        );

        var allergyWithDetails = await _patientAllergyRepository.GetPatientAllergyWithDetailsAsync(createdAllergy.Id);
        return MapToDto(allergyWithDetails!);
    }

    public async Task UpdatePatientAllergyAsync(int id, UpdatePatientAllergyDto updatePatientAllergyDto)
    {
        var allergy = await _patientAllergyRepository.GetByIdAsync(id);
        if (allergy == null)
        {
            throw new ArgumentException("Patient allergy not found");
        }

        if (!string.IsNullOrEmpty(updatePatientAllergyDto.AllergenName))
            allergy.AllergenName = updatePatientAllergyDto.AllergenName;
        if (!string.IsNullOrEmpty(updatePatientAllergyDto.AllergyType))
            allergy.AllergyType = updatePatientAllergyDto.AllergyType;
        if (!string.IsNullOrEmpty(updatePatientAllergyDto.Severity))
            allergy.Severity = updatePatientAllergyDto.Severity;
        if (updatePatientAllergyDto.Reaction != null)
            allergy.Reaction = updatePatientAllergyDto.Reaction;
        if (updatePatientAllergyDto.OnsetDate.HasValue)
            allergy.OnsetDate = updatePatientAllergyDto.OnsetDate;
        if (updatePatientAllergyDto.Notes != null)
            allergy.Notes = updatePatientAllergyDto.Notes;
        if (updatePatientAllergyDto.IsActive.HasValue)
            allergy.IsActive = updatePatientAllergyDto.IsActive.Value;

        allergy.UpdatedAt = DateTime.UtcNow;

        await _patientAllergyRepository.UpdateAsync(allergy);
        await _auditService.WriteAsync("system", "Admin", "Update", "PatientAllergy", allergy.Id.ToString(), "Updated fields");
    }

    public async Task DeletePatientAllergyAsync(int id)
    {
        var allergy = await _patientAllergyRepository.GetByIdAsync(id);
        if (allergy == null)
        {
            throw new ArgumentException("Patient allergy not found");
        }

        await _patientAllergyRepository.DeleteAsync(allergy);
        await _auditService.WriteAsync("system", "Admin", "Delete", "PatientAllergy", allergy.Id.ToString(), "Deleted");
    }

    private static PatientAllergyDto MapToDto(PatientAllergy allergy) => new()
    {
        Id = allergy.Id,
        AllergenName = allergy.AllergenName,
        AllergyType = allergy.AllergyType,
        Severity = allergy.Severity,
        Reaction = allergy.Reaction,
        OnsetDate = allergy.OnsetDate,
        Notes = allergy.Notes,
        IsActive = allergy.IsActive,
        CreatedAt = allergy.CreatedAt,
        UpdatedAt = allergy.UpdatedAt,
        PatientId = allergy.PatientId,
        PatientName = $"{allergy.Patient?.User?.FirstName} {allergy.Patient?.User?.LastName}".Trim(),
        RecordedByUserId = allergy.RecordedByUserId,
        RecordedByUserName = allergy.RecordedByUser != null
            ? $"{allergy.RecordedByUser.FirstName} {allergy.RecordedByUser.LastName}".Trim()
            : null
    };
}

