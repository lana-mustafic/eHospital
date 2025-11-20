using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class ClaimService : IClaimService
{
    private readonly IClaimRepository _claimRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IPatientInsuranceRepository _patientInsuranceRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ClaimService> _logger;
    private readonly IAuditService _auditService;

    public ClaimService(
        IClaimRepository claimRepository,
        IInvoiceRepository invoiceRepository,
        IPatientInsuranceRepository patientInsuranceRepository,
        IUserRepository userRepository,
        ILogger<ClaimService> logger,
        IAuditService auditService)
    {
        _claimRepository = claimRepository;
        _invoiceRepository = invoiceRepository;
        _patientInsuranceRepository = patientInsuranceRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<ClaimDto>> GetAllClaimsAsync()
    {
        var claims = await _claimRepository.GetAllClaimsWithDetailsAsync();
        return claims.Select(MapToDto);
    }

    public async Task<ClaimDto?> GetClaimByIdAsync(int id)
    {
        var claim = await _claimRepository.GetClaimWithDetailsAsync(id);
        return claim != null ? MapToDto(claim) : null;
    }

    public async Task<IEnumerable<ClaimDto>> GetClaimsByPatientAsync(int patientId)
    {
        var claims = await _claimRepository.GetClaimsByPatientAsync(patientId);
        return claims.Select(MapToDto);
    }

    public async Task<IEnumerable<ClaimDto>> GetClaimsByInvoiceAsync(int invoiceId)
    {
        var claims = await _claimRepository.GetClaimsByInvoiceAsync(invoiceId);
        return claims.Select(MapToDto);
    }

    public async Task<IEnumerable<ClaimDto>> GetClaimsByStatusAsync(string status)
    {
        var claims = await _claimRepository.GetClaimsByStatusAsync(status);
        return claims.Select(MapToDto);
    }

    public async Task<ClaimDto> CreateClaimAsync(CreateClaimDto createDto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(createDto.InvoiceId);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found");
        }

        var patientInsurance = await _patientInsuranceRepository.GetByIdAsync(createDto.PatientInsuranceId);
        if (patientInsurance == null)
        {
            throw new ArgumentException("Patient insurance not found");
        }

        if (!patientInsurance.IsVerified)
        {
            throw new InvalidOperationException("Cannot create claim for unverified insurance");
        }

        // Generate unique claim number
        var claimNumber = $"CLM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        var claim = new Claim
        {
            ClaimNumber = claimNumber,
            ServiceDate = createDto.ServiceDate,
            TotalCharges = invoice.TotalAmount,
            Status = "Draft",
            DiagnosisCodes = createDto.DiagnosisCodes,
            ProcedureCodes = createDto.ProcedureCodes,
            Notes = createDto.Notes,
            InvoiceId = createDto.InvoiceId,
            PatientInsuranceId = createDto.PatientInsuranceId,
            SubmittedByUserId = createDto.SubmittedByUserId
        };

        var created = await _claimRepository.AddAsync(claim);
        await _auditService.WriteAsync("system", "Admin", "Create", "Claim", created.Id.ToString(), $"ClaimNumber={created.ClaimNumber}, InvoiceId={created.InvoiceId}");

        var withDetails = await _claimRepository.GetClaimWithDetailsAsync(created.Id);
        return MapToDto(withDetails!);
    }

    public async Task UpdateClaimAsync(int id, UpdateClaimDto updateDto)
    {
        var claim = await _claimRepository.GetByIdAsync(id);
        if (claim == null)
        {
            throw new ArgumentException("Claim not found");
        }

        if (!string.IsNullOrEmpty(updateDto.Status))
            claim.Status = updateDto.Status;
        if (updateDto.StatusReason != null)
            claim.StatusReason = updateDto.StatusReason;
        if (updateDto.ApprovedAmount.HasValue)
            claim.ApprovedAmount = updateDto.ApprovedAmount;
        if (updateDto.PaidAmount.HasValue)
            claim.PaidAmount = updateDto.PaidAmount;
        if (updateDto.PatientResponsibility.HasValue)
            claim.PatientResponsibility = updateDto.PatientResponsibility;
        if (updateDto.ExternalClaimId != null)
            claim.ExternalClaimId = updateDto.ExternalClaimId;
        if (updateDto.Notes != null)
            claim.Notes = updateDto.Notes;

        claim.UpdatedAt = DateTime.UtcNow;
        await _claimRepository.UpdateAsync(claim);
        await _auditService.WriteAsync("system", "Admin", "Update", "Claim", claim.Id.ToString(), "Updated fields");
    }

    public async Task<ClaimDto> SubmitClaimAsync(int id, SubmitClaimDto submitDto)
    {
        var claim = await _claimRepository.GetByIdAsync(id);
        if (claim == null)
        {
            throw new ArgumentException("Claim not found");
        }

        if (claim.Status != "Draft")
        {
            throw new InvalidOperationException($"Cannot submit claim with status: {claim.Status}");
        }

        claim.Status = "Submitted";
        claim.SubmissionDate = DateTime.UtcNow;
        claim.SubmittedByUserId = submitDto.SubmittedByUserId;
        if (!string.IsNullOrEmpty(submitDto.Notes))
        {
            claim.Notes = (claim.Notes ?? "") + "\n" + submitDto.Notes;
        }

        claim.UpdatedAt = DateTime.UtcNow;
        await _claimRepository.UpdateAsync(claim);
        await _auditService.WriteAsync("system", "Admin", "Submit", "Claim", claim.Id.ToString(), $"SubmittedBy={submitDto.SubmittedByUserId}");

        var withDetails = await _claimRepository.GetClaimWithDetailsAsync(id);
        return MapToDto(withDetails!);
    }

    public async Task DeleteClaimAsync(int id)
    {
        var claim = await _claimRepository.GetByIdAsync(id);
        if (claim == null)
        {
            throw new ArgumentException("Claim not found");
        }

        if (claim.Status == "Submitted" || claim.Status == "Paid")
        {
            throw new InvalidOperationException("Cannot delete submitted or paid claim");
        }

        await _claimRepository.DeleteAsync(claim);
        await _auditService.WriteAsync("system", "Admin", "Delete", "Claim", claim.Id.ToString(), $"ClaimNumber={claim.ClaimNumber}");
    }

    public async Task<ClaimDenialDto> AddDenialAsync(int claimId, CreateClaimDenialDto createDto)
    {
        var claim = await _claimRepository.GetByIdAsync(claimId);
        if (claim == null)
        {
            throw new ArgumentException("Claim not found");
        }

        var denial = new ClaimDenial
        {
            DenialCode = createDto.DenialCode,
            DenialReason = createDto.DenialReason,
            AdjustmentCode = createDto.AdjustmentCode,
            DeniedAmount = createDto.DeniedAmount,
            DenialDate = createDto.DenialDate,
            Status = "Active",
            ClaimId = claimId
        };

        // Update claim status if not already denied
        if (claim.Status != "Denied")
        {
            claim.Status = "Denied";
            claim.StatusReason = createDto.DenialReason;
            claim.UpdatedAt = DateTime.UtcNow;
            await _claimRepository.UpdateAsync(claim);
        }

        // Add denial to claim's denials collection
        claim.Denials.Add(denial);
        await _claimRepository.UpdateAsync(claim);

        await _auditService.WriteAsync("system", "Admin", "AddDenial", "Claim", claimId.ToString(), $"DenialCode={denial.DenialCode}");

        return new ClaimDenialDto
        {
            Id = denial.Id,
            DenialCode = denial.DenialCode,
            DenialReason = denial.DenialReason,
            AdjustmentCode = denial.AdjustmentCode,
            DeniedAmount = denial.DeniedAmount,
            DenialDate = denial.DenialDate,
            Status = denial.Status,
            ClaimId = denial.ClaimId
        };
    }

    public async Task<ClaimPaymentDto> PostPaymentAsync(int claimId, CreateClaimPaymentDto createDto)
    {
        var claim = await _claimRepository.GetClaimWithDetailsAsync(claimId);
        if (claim == null)
        {
            throw new ArgumentException("Claim not found");
        }

        var payment = new ClaimPayment
        {
            PaymentReference = createDto.PaymentReference,
            PaymentDate = createDto.PaymentDate,
            Amount = createDto.Amount,
            CheckNumber = createDto.CheckNumber,
            EFTReference = createDto.EFTReference,
            Notes = createDto.Notes,
            ClaimId = claimId,
            PostedByUserId = createDto.PostedByUserId
        };

        // Add payment to claim's payments collection
        claim.Payments.Add(payment);

        // Update claim paid amount
        var totalPaid = claim.Payments.Sum(p => p.Amount);
        claim.PaidAmount = totalPaid;

        // Update claim status based on payment
        if (claim.PaidAmount >= claim.TotalCharges)
        {
            claim.Status = "Paid";
        }
        else if (claim.PaidAmount > 0)
        {
            claim.Status = "PartiallyPaid";
        }

        claim.UpdatedAt = DateTime.UtcNow;
        await _claimRepository.UpdateAsync(claim);

        await _auditService.WriteAsync("system", "Admin", "PostPayment", "Claim", claimId.ToString(), $"Amount={payment.Amount}, PaymentReference={payment.PaymentReference}");

        return new ClaimPaymentDto
        {
            Id = payment.Id,
            PaymentReference = payment.PaymentReference,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            CheckNumber = payment.CheckNumber,
            EFTReference = payment.EFTReference,
            Notes = payment.Notes,
            CreatedAt = payment.CreatedAt,
            ClaimId = payment.ClaimId,
            PostedByUserId = payment.PostedByUserId,
            PostedByUserName = payment.PostedByUser != null 
                ? $"{payment.PostedByUser.FirstName} {payment.PostedByUser.LastName}".Trim() 
                : null
        };
    }

    public async Task<IEnumerable<ClaimDenialDto>> GetDenialsByClaimAsync(int claimId)
    {
        var claim = await _claimRepository.GetClaimWithDetailsAsync(claimId);
        if (claim == null)
        {
            return Enumerable.Empty<ClaimDenialDto>();
        }

        return claim.Denials.Select(d => new ClaimDenialDto
        {
            Id = d.Id,
            DenialCode = d.DenialCode,
            DenialReason = d.DenialReason,
            AdjustmentCode = d.AdjustmentCode,
            DeniedAmount = d.DeniedAmount,
            DenialDate = d.DenialDate,
            Status = d.Status,
            AppealNotes = d.AppealNotes,
            AppealDate = d.AppealDate,
            ResolutionNotes = d.ResolutionNotes,
            ClaimId = d.ClaimId,
            ResolvedByUserId = d.ResolvedByUserId,
            ResolvedByUserName = d.ResolvedByUser != null 
                ? $"{d.ResolvedByUser.FirstName} {d.ResolvedByUser.LastName}".Trim() 
                : null
        });
    }

    public async Task<IEnumerable<ClaimPaymentDto>> GetPaymentsByClaimAsync(int claimId)
    {
        var claim = await _claimRepository.GetClaimWithDetailsAsync(claimId);
        if (claim == null)
        {
            return Enumerable.Empty<ClaimPaymentDto>();
        }

        return claim.Payments.Select(p => new ClaimPaymentDto
        {
            Id = p.Id,
            PaymentReference = p.PaymentReference,
            PaymentDate = p.PaymentDate,
            Amount = p.Amount,
            CheckNumber = p.CheckNumber,
            EFTReference = p.EFTReference,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt,
            ClaimId = p.ClaimId,
            PostedByUserId = p.PostedByUserId,
            PostedByUserName = p.PostedByUser != null 
                ? $"{p.PostedByUser.FirstName} {p.PostedByUser.LastName}".Trim() 
                : null
        });
    }

    private static ClaimDto MapToDto(Claim claim) => new()
    {
        Id = claim.Id,
        ClaimNumber = claim.ClaimNumber,
        ExternalClaimId = claim.ExternalClaimId,
        ServiceDate = claim.ServiceDate,
        SubmissionDate = claim.SubmissionDate,
        TotalCharges = claim.TotalCharges,
        ApprovedAmount = claim.ApprovedAmount,
        PaidAmount = claim.PaidAmount,
        PatientResponsibility = claim.PatientResponsibility,
        Status = claim.Status,
        StatusReason = claim.StatusReason,
        DiagnosisCodes = claim.DiagnosisCodes,
        ProcedureCodes = claim.ProcedureCodes,
        Notes = claim.Notes,
        CreatedAt = claim.CreatedAt,
        InvoiceId = claim.InvoiceId,
        InvoiceNumber = claim.Invoice?.InvoiceNumber ?? string.Empty,
        PatientInsuranceId = claim.PatientInsuranceId,
        InsuranceProviderName = claim.PatientInsurance?.InsuranceProvider?.Name ?? string.Empty,
        PatientId = claim.Invoice?.PatientId ?? 0,
        PatientName = $"{claim.Invoice?.Patient?.User?.FirstName} {claim.Invoice?.Patient?.User?.LastName}".Trim(),
        SubmittedByUserId = claim.SubmittedByUserId,
        SubmittedByUserName = claim.SubmittedByUser != null 
            ? $"{claim.SubmittedByUser.FirstName} {claim.SubmittedByUser.LastName}".Trim() 
            : null,
        Denials = claim.Denials.Select(d => new ClaimDenialDto
        {
            Id = d.Id,
            DenialCode = d.DenialCode,
            DenialReason = d.DenialReason,
            AdjustmentCode = d.AdjustmentCode,
            DeniedAmount = d.DeniedAmount,
            DenialDate = d.DenialDate,
            Status = d.Status,
            AppealNotes = d.AppealNotes,
            AppealDate = d.AppealDate,
            ResolutionNotes = d.ResolutionNotes,
            ClaimId = d.ClaimId,
            ResolvedByUserId = d.ResolvedByUserId,
            ResolvedByUserName = d.ResolvedByUser != null 
                ? $"{d.ResolvedByUser.FirstName} {d.ResolvedByUser.LastName}".Trim() 
                : null
        }).ToList(),
        Payments = claim.Payments.Select(p => new ClaimPaymentDto
        {
            Id = p.Id,
            PaymentReference = p.PaymentReference,
            PaymentDate = p.PaymentDate,
            Amount = p.Amount,
            CheckNumber = p.CheckNumber,
            EFTReference = p.EFTReference,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt,
            ClaimId = p.ClaimId,
            PostedByUserId = p.PostedByUserId,
            PostedByUserName = p.PostedByUser != null 
                ? $"{p.PostedByUser.FirstName} {p.PostedByUser.LastName}".Trim() 
                : null
        }).ToList()
    };
}

