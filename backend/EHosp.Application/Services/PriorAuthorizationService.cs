using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class PriorAuthorizationService : IPriorAuthorizationService
{
    private readonly IPriorAuthorizationRepository _priorAuthRepository;
    private readonly IPatientInsuranceRepository _patientInsuranceRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<PriorAuthorizationService> _logger;
    private readonly IAuditService _auditService;

    public PriorAuthorizationService(
        IPriorAuthorizationRepository priorAuthRepository,
        IPatientInsuranceRepository patientInsuranceRepository,
        IUserRepository userRepository,
        ILogger<PriorAuthorizationService> logger,
        IAuditService auditService)
    {
        _priorAuthRepository = priorAuthRepository;
        _patientInsuranceRepository = patientInsuranceRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<PriorAuthorizationDto>> GetAllPriorAuthorizationsAsync()
    {
        var authorizations = await _priorAuthRepository.GetAllPriorAuthorizationsWithDetailsAsync();
        return authorizations.Select(MapToDto);
    }

    public async Task<PriorAuthorizationDto?> GetPriorAuthorizationByIdAsync(int id)
    {
        var authorization = await _priorAuthRepository.GetPriorAuthorizationWithDetailsAsync(id);
        return authorization != null ? MapToDto(authorization) : null;
    }

    public async Task<IEnumerable<PriorAuthorizationDto>> GetPriorAuthorizationsByPatientAsync(int patientId)
    {
        var authorizations = await _priorAuthRepository.GetPriorAuthorizationsByPatientAsync(patientId);
        return authorizations.Select(MapToDto);
    }

    public async Task<IEnumerable<PriorAuthorizationDto>> GetPriorAuthorizationsByStatusAsync(string status)
    {
        var authorizations = await _priorAuthRepository.GetPriorAuthorizationsByStatusAsync(status);
        return authorizations.Select(MapToDto);
    }

    public async Task<PriorAuthorizationDto> CreatePriorAuthorizationAsync(CreatePriorAuthorizationDto createDto)
    {
        var patientInsurance = await _patientInsuranceRepository.GetByIdAsync(createDto.PatientInsuranceId);
        if (patientInsurance == null)
        {
            throw new ArgumentException("Patient insurance not found");
        }

        if (!patientInsurance.IsVerified)
        {
            throw new InvalidOperationException("Cannot create prior authorization for unverified insurance");
        }

        // Generate unique request number
        var requestNumber = $"PA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        var authorization = new PriorAuthorization
        {
            RequestNumber = requestNumber,
            RequestDate = DateTime.UtcNow,
            Status = "Pending",
            ServiceType = createDto.ServiceType,
            ServiceDescription = createDto.ServiceDescription,
            DiagnosisCode = createDto.DiagnosisCode,
            ProcedureCode = createDto.ProcedureCode,
            RequestedAmount = createDto.RequestedAmount,
            Units = createDto.Units,
            Notes = createDto.Notes,
            PatientInsuranceId = createDto.PatientInsuranceId,
            RelatedInvoiceId = createDto.RelatedInvoiceId,
            RelatedAppointmentId = createDto.RelatedAppointmentId,
            RequestedByUserId = createDto.RequestedByUserId
        };

        var created = await _priorAuthRepository.AddAsync(authorization);
        await _auditService.WriteAsync("system", "Admin", "Create", "PriorAuthorization", created.Id.ToString(), $"RequestNumber={created.RequestNumber}");

        var withDetails = await _priorAuthRepository.GetPriorAuthorizationWithDetailsAsync(created.Id);
        return MapToDto(withDetails!);
    }

    public async Task UpdatePriorAuthorizationAsync(int id, UpdatePriorAuthorizationDto updateDto)
    {
        var authorization = await _priorAuthRepository.GetByIdAsync(id);
        if (authorization == null)
        {
            throw new ArgumentException("Prior authorization not found");
        }

        if (!string.IsNullOrEmpty(updateDto.AuthorizationNumber))
            authorization.AuthorizationNumber = updateDto.AuthorizationNumber;
        if (updateDto.ApprovalDate.HasValue)
            authorization.ApprovalDate = updateDto.ApprovalDate;
        if (updateDto.ExpirationDate.HasValue)
            authorization.ExpirationDate = updateDto.ExpirationDate;
        if (!string.IsNullOrEmpty(updateDto.Status))
            authorization.Status = updateDto.Status;
        if (updateDto.ApprovedAmount.HasValue)
            authorization.ApprovedAmount = updateDto.ApprovedAmount;
        if (updateDto.DenialReason != null)
            authorization.DenialReason = updateDto.DenialReason;
        if (updateDto.Notes != null)
            authorization.Notes = updateDto.Notes;

        authorization.UpdatedAt = DateTime.UtcNow;
        await _priorAuthRepository.UpdateAsync(authorization);
        await _auditService.WriteAsync("system", "Admin", "Update", "PriorAuthorization", authorization.Id.ToString(), "Updated fields");
    }

    public async Task DeletePriorAuthorizationAsync(int id)
    {
        var authorization = await _priorAuthRepository.GetByIdAsync(id);
        if (authorization == null)
        {
            throw new ArgumentException("Prior authorization not found");
        }

        if (authorization.Status == "Approved")
        {
            throw new InvalidOperationException("Cannot delete approved prior authorization");
        }

        await _priorAuthRepository.DeleteAsync(authorization);
        await _auditService.WriteAsync("system", "Admin", "Delete", "PriorAuthorization", authorization.Id.ToString(), $"RequestNumber={authorization.RequestNumber}");
    }

    private static PriorAuthorizationDto MapToDto(PriorAuthorization authorization) => new()
    {
        Id = authorization.Id,
        AuthorizationNumber = authorization.AuthorizationNumber,
        RequestNumber = authorization.RequestNumber,
        RequestDate = authorization.RequestDate,
        ApprovalDate = authorization.ApprovalDate,
        ExpirationDate = authorization.ExpirationDate,
        Status = authorization.Status,
        ServiceType = authorization.ServiceType,
        ServiceDescription = authorization.ServiceDescription,
        DiagnosisCode = authorization.DiagnosisCode,
        ProcedureCode = authorization.ProcedureCode,
        RequestedAmount = authorization.RequestedAmount,
        ApprovedAmount = authorization.ApprovedAmount,
        Units = authorization.Units,
        DenialReason = authorization.DenialReason,
        Notes = authorization.Notes,
        CreatedAt = authorization.CreatedAt,
        PatientInsuranceId = authorization.PatientInsuranceId,
        InsuranceProviderName = authorization.PatientInsurance?.InsuranceProvider?.Name ?? string.Empty,
        PatientId = authorization.PatientInsurance?.PatientId ?? 0,
        PatientName = $"{authorization.PatientInsurance?.Patient?.User?.FirstName} {authorization.PatientInsurance?.Patient?.User?.LastName}".Trim(),
        RelatedInvoiceId = authorization.RelatedInvoiceId,
        RelatedInvoiceNumber = authorization.RelatedInvoice?.InvoiceNumber,
        RelatedAppointmentId = authorization.RelatedAppointmentId,
        RequestedByUserId = authorization.RequestedByUserId,
        RequestedByUserName = authorization.RequestedByUser != null 
            ? $"{authorization.RequestedByUser.FirstName} {authorization.RequestedByUser.LastName}".Trim() 
            : null
    };
}

