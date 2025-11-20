using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class PatientInsuranceService : IPatientInsuranceService
{
    private readonly IPatientInsuranceRepository _patientInsuranceRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IInsuranceProviderRepository _providerRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<PatientInsuranceService> _logger;
    private readonly IAuditService _auditService;

    public PatientInsuranceService(
        IPatientInsuranceRepository patientInsuranceRepository,
        IPatientRepository patientRepository,
        IInsuranceProviderRepository providerRepository,
        IUserRepository userRepository,
        ILogger<PatientInsuranceService> logger,
        IAuditService auditService)
    {
        _patientInsuranceRepository = patientInsuranceRepository;
        _patientRepository = patientRepository;
        _providerRepository = providerRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<PatientInsuranceDto>> GetAllPatientInsurancesAsync()
    {
        var insurances = await _patientInsuranceRepository.GetAllPatientInsurancesWithDetailsAsync();
        return insurances.Select(MapToDto);
    }

    public async Task<PatientInsuranceDto?> GetPatientInsuranceByIdAsync(int id)
    {
        var insurance = await _patientInsuranceRepository.GetPatientInsuranceWithDetailsAsync(id);
        return insurance != null ? MapToDto(insurance) : null;
    }

    public async Task<IEnumerable<PatientInsuranceDto>> GetPatientInsurancesByPatientAsync(int patientId)
    {
        var insurances = await _patientInsuranceRepository.GetPatientInsurancesByPatientAsync(patientId);
        return insurances.Select(MapToDto);
    }

    public async Task<IEnumerable<PatientInsuranceDto>> GetActivePatientInsurancesByPatientAsync(int patientId)
    {
        var insurances = await _patientInsuranceRepository.GetActivePatientInsurancesByPatientAsync(patientId);
        return insurances.Select(MapToDto);
    }

    public async Task<PatientInsuranceDto> CreatePatientInsuranceAsync(CreatePatientInsuranceDto createDto)
    {
        var patient = await _patientRepository.GetByIdAsync(createDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        var provider = await _providerRepository.GetByIdAsync(createDto.InsuranceProviderId);
        if (provider == null)
        {
            throw new ArgumentException("Insurance provider not found");
        }

        var insurance = new PatientInsurance
        {
            PolicyNumber = createDto.PolicyNumber,
            GroupNumber = createDto.GroupNumber,
            SubscriberId = createDto.SubscriberId,
            SubscriberName = createDto.SubscriberName,
            EffectiveDate = createDto.EffectiveDate,
            ExpirationDate = createDto.ExpirationDate,
            CopayAmount = createDto.CopayAmount,
            Deductible = createDto.Deductible,
            Coinsurance = createDto.Coinsurance,
            CoverageType = createDto.CoverageType ?? "Primary",
            IsActive = true,
            IsVerified = false,
            PatientId = createDto.PatientId,
            InsuranceProviderId = createDto.InsuranceProviderId
        };

        var created = await _patientInsuranceRepository.AddAsync(insurance);
        await _auditService.WriteAsync("system", "Admin", "Create", "PatientInsurance", created.Id.ToString(), $"PatientId={created.PatientId}, PolicyNumber={created.PolicyNumber}");
        
        var withDetails = await _patientInsuranceRepository.GetPatientInsuranceWithDetailsAsync(created.Id);
        return MapToDto(withDetails!);
    }

    public async Task UpdatePatientInsuranceAsync(int id, UpdatePatientInsuranceDto updateDto)
    {
        var insurance = await _patientInsuranceRepository.GetByIdAsync(id);
        if (insurance == null)
        {
            throw new ArgumentException("Patient insurance not found");
        }

        if (!string.IsNullOrEmpty(updateDto.PolicyNumber))
            insurance.PolicyNumber = updateDto.PolicyNumber;
        if (updateDto.GroupNumber != null)
            insurance.GroupNumber = updateDto.GroupNumber;
        if (updateDto.SubscriberId != null)
            insurance.SubscriberId = updateDto.SubscriberId;
        if (updateDto.SubscriberName != null)
            insurance.SubscriberName = updateDto.SubscriberName;
        if (updateDto.EffectiveDate.HasValue)
            insurance.EffectiveDate = updateDto.EffectiveDate;
        if (updateDto.ExpirationDate.HasValue)
            insurance.ExpirationDate = updateDto.ExpirationDate;
        if (updateDto.CopayAmount != null)
            insurance.CopayAmount = updateDto.CopayAmount;
        if (updateDto.Deductible != null)
            insurance.Deductible = updateDto.Deductible;
        if (updateDto.Coinsurance != null)
            insurance.Coinsurance = updateDto.Coinsurance;
        if (updateDto.CoverageType != null)
            insurance.CoverageType = updateDto.CoverageType;
        if (updateDto.IsActive.HasValue)
            insurance.IsActive = updateDto.IsActive.Value;

        insurance.UpdatedAt = DateTime.UtcNow;
        await _patientInsuranceRepository.UpdateAsync(insurance);
        await _auditService.WriteAsync("system", "Admin", "Update", "PatientInsurance", insurance.Id.ToString(), "Updated fields");
    }

    public async Task<PatientInsuranceDto> VerifyInsuranceAsync(int id, VerifyInsuranceDto verifyDto)
    {
        var insurance = await _patientInsuranceRepository.GetByIdAsync(id);
        if (insurance == null)
        {
            throw new ArgumentException("Patient insurance not found");
        }

        if (verifyDto.VerifiedByUserId > 0)
        {
            var user = await _userRepository.GetByIdAsync(verifyDto.VerifiedByUserId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        insurance.IsVerified = true;
        insurance.VerifiedAt = DateTime.UtcNow;
        insurance.VerifiedByUserId = verifyDto.VerifiedByUserId;
        insurance.VerificationNotes = verifyDto.VerificationNotes;

        insurance.UpdatedAt = DateTime.UtcNow;
        await _patientInsuranceRepository.UpdateAsync(insurance);
        await _auditService.WriteAsync("system", "Admin", "Verify", "PatientInsurance", insurance.Id.ToString(), $"VerifiedBy={verifyDto.VerifiedByUserId}");

        var withDetails = await _patientInsuranceRepository.GetPatientInsuranceWithDetailsAsync(id);
        return MapToDto(withDetails!);
    }

    public async Task DeletePatientInsuranceAsync(int id)
    {
        var insurance = await _patientInsuranceRepository.GetByIdAsync(id);
        if (insurance == null)
        {
            throw new ArgumentException("Patient insurance not found");
        }

        await _patientInsuranceRepository.DeleteAsync(insurance);
        await _auditService.WriteAsync("system", "Admin", "Delete", "PatientInsurance", insurance.Id.ToString(), $"PolicyNumber={insurance.PolicyNumber}");
    }

    private static PatientInsuranceDto MapToDto(PatientInsurance insurance) => new()
    {
        Id = insurance.Id,
        PolicyNumber = insurance.PolicyNumber,
        GroupNumber = insurance.GroupNumber,
        SubscriberId = insurance.SubscriberId,
        SubscriberName = insurance.SubscriberName,
        EffectiveDate = insurance.EffectiveDate,
        ExpirationDate = insurance.ExpirationDate,
        CopayAmount = insurance.CopayAmount,
        Deductible = insurance.Deductible,
        Coinsurance = insurance.Coinsurance,
        CoverageType = insurance.CoverageType,
        IsActive = insurance.IsActive,
        IsVerified = insurance.IsVerified,
        VerifiedAt = insurance.VerifiedAt,
        VerifiedByUserId = insurance.VerifiedByUserId,
        VerifiedByUserName = insurance.VerifiedByUser != null 
            ? $"{insurance.VerifiedByUser.FirstName} {insurance.VerifiedByUser.LastName}".Trim() 
            : null,
        VerificationNotes = insurance.VerificationNotes,
        PatientId = insurance.PatientId,
        PatientName = $"{insurance.Patient?.User?.FirstName} {insurance.Patient?.User?.LastName}".Trim(),
        InsuranceProviderId = insurance.InsuranceProviderId,
        InsuranceProviderName = insurance.InsuranceProvider?.Name ?? string.Empty
    };
}

