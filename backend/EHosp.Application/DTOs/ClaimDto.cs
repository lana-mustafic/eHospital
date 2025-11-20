using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class ClaimDto
{
    public int Id { get; set; }
    public string ClaimNumber { get; set; } = string.Empty;
    public string? ExternalClaimId { get; set; }
    public DateTime ServiceDate { get; set; }
    public DateTime? SubmissionDate { get; set; }
    public decimal TotalCharges { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public decimal? PatientResponsibility { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? StatusReason { get; set; }
    public string? DiagnosisCodes { get; set; }
    public string? ProcedureCodes { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int PatientInsuranceId { get; set; }
    public string InsuranceProviderName { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int? SubmittedByUserId { get; set; }
    public string? SubmittedByUserName { get; set; }
    public List<ClaimDenialDto> Denials { get; set; } = new();
    public List<ClaimPaymentDto> Payments { get; set; } = new();
}

public class CreateClaimDto
{
    [Required]
    public DateTime ServiceDate { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int InvoiceId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int PatientInsuranceId { get; set; }

    public string? DiagnosisCodes { get; set; }
    public string? ProcedureCodes { get; set; }
    public string? Notes { get; set; }

    [Range(1, int.MaxValue)]
    public int? SubmittedByUserId { get; set; }
}

public class UpdateClaimDto
{
    public string? Status { get; set; }
    public string? StatusReason { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public decimal? PatientResponsibility { get; set; }
    public string? ExternalClaimId { get; set; }
    public string? Notes { get; set; }
}

public class SubmitClaimDto
{
    [Range(1, int.MaxValue)]
    public int SubmittedByUserId { get; set; }

    public string? Notes { get; set; }
}

public class ClaimDenialDto
{
    public int Id { get; set; }
    public string DenialCode { get; set; } = string.Empty;
    public string DenialReason { get; set; } = string.Empty;
    public string? AdjustmentCode { get; set; }
    public decimal DeniedAmount { get; set; }
    public DateTime DenialDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AppealNotes { get; set; }
    public DateTime? AppealDate { get; set; }
    public string? ResolutionNotes { get; set; }
    public int ClaimId { get; set; }
    public int? ResolvedByUserId { get; set; }
    public string? ResolvedByUserName { get; set; }
}

public class CreateClaimDenialDto
{
    [Required]
    [StringLength(50)]
    public string DenialCode { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string DenialReason { get; set; } = string.Empty;

    [StringLength(50)]
    public string? AdjustmentCode { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal DeniedAmount { get; set; }

    [Required]
    public DateTime DenialDate { get; set; }
}

public class ClaimPaymentDto
{
    public int Id { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string? CheckNumber { get; set; }
    public string? EFTReference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ClaimId { get; set; }
    public int? PostedByUserId { get; set; }
    public string? PostedByUserName { get; set; }
}

public class CreateClaimPaymentDto
{
    [Required]
    [StringLength(100)]
    public string PaymentReference { get; set; } = string.Empty;

    [Required]
    public DateTime PaymentDate { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    public string? CheckNumber { get; set; }
    public string? EFTReference { get; set; }
    public string? Notes { get; set; }

    [Range(1, int.MaxValue)]
    public int? PostedByUserId { get; set; }
}

