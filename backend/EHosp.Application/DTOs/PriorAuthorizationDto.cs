using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class PriorAuthorizationDto
{
    public int Id { get; set; }
    public string AuthorizationNumber { get; set; } = string.Empty;
    public string? RequestNumber { get; set; }
    public DateTime RequestDate { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ServiceType { get; set; }
    public string? ServiceDescription { get; set; }
    public string? DiagnosisCode { get; set; }
    public string? ProcedureCode { get; set; }
    public decimal? RequestedAmount { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public int? Units { get; set; }
    public string? DenialReason { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PatientInsuranceId { get; set; }
    public string InsuranceProviderName { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int? RelatedInvoiceId { get; set; }
    public string? RelatedInvoiceNumber { get; set; }
    public int? RelatedAppointmentId { get; set; }
    public int? RequestedByUserId { get; set; }
    public string? RequestedByUserName { get; set; }
}

public class CreatePriorAuthorizationDto
{
    [Required]
    [StringLength(100)]
    public string? ServiceType { get; set; }

    [StringLength(500)]
    public string? ServiceDescription { get; set; }

    public string? DiagnosisCode { get; set; }
    public string? ProcedureCode { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? RequestedAmount { get; set; }

    [Range(1, int.MaxValue)]
    public int? Units { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int PatientInsuranceId { get; set; }

    [Range(1, int.MaxValue)]
    public int? RelatedInvoiceId { get; set; }

    [Range(1, int.MaxValue)]
    public int? RelatedAppointmentId { get; set; }

    public string? Notes { get; set; }

    [Range(1, int.MaxValue)]
    public int? RequestedByUserId { get; set; }
}

public class UpdatePriorAuthorizationDto
{
    [StringLength(100)]
    public string? AuthorizationNumber { get; set; }

    public DateTime? ApprovalDate { get; set; }
    public DateTime? ExpirationDate { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? ApprovedAmount { get; set; }

    [StringLength(500)]
    public string? DenialReason { get; set; }

    public string? Notes { get; set; }
}

