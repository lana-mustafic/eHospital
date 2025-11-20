namespace EHosp.Domain.Entities;

public class PriorAuthorization
{
    public int Id { get; set; }
    public string AuthorizationNumber { get; set; } = string.Empty; // Authorization number from insurance
    public string? RequestNumber { get; set; } // Internal request tracking number
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovalDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Denied, Expired, Cancelled
    public string? ServiceType { get; set; } // Procedure, Medication, Durable Medical Equipment, etc.
    public string? ServiceDescription { get; set; }
    public string? DiagnosisCode { get; set; } // ICD-10 code
    public string? ProcedureCode { get; set; } // CPT code
    public decimal? RequestedAmount { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public int? Units { get; set; } // Number of units/services requested
    public string? DenialReason { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public int? RequestedByUserId { get; set; }

    // Foreign keys
    public int PatientInsuranceId { get; set; }
    public int? RelatedInvoiceId { get; set; } // Optional: Link to invoice if created for specific service
    public int? RelatedAppointmentId { get; set; } // Optional: Link to appointment

    // Navigation properties
    public PatientInsurance PatientInsurance { get; set; } = null!;
    public Invoice? RelatedInvoice { get; set; }
    public Appointment? RelatedAppointment { get; set; }
    public User? RequestedByUser { get; set; }
}

