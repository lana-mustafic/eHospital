using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class InsuranceProviderDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? PayerId { get; set; }
    public string? ContactPerson { get; set; }
    public bool IsActive { get; set; }
}

public class CreateInsuranceProviderDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Code { get; set; }

    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [EmailAddress]
    [StringLength(100)]
    public string? Email { get; set; }

    public string? Website { get; set; }

    [StringLength(50)]
    public string? PayerId { get; set; }

    public string? ContactPerson { get; set; }
}

public class UpdateInsuranceProviderDto
{
    [StringLength(200)]
    public string? Name { get; set; }

    [StringLength(50)]
    public string? Code { get; set; }

    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [EmailAddress]
    [StringLength(100)]
    public string? Email { get; set; }

    public string? Website { get; set; }

    [StringLength(50)]
    public string? PayerId { get; set; }

    public string? ContactPerson { get; set; }

    public bool? IsActive { get; set; }
}

public class PatientInsuranceDto
{
    public int Id { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string? GroupNumber { get; set; }
    public string? SubscriberId { get; set; }
    public string? SubscriberName { get; set; }
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? CopayAmount { get; set; }
    public string? Deductible { get; set; }
    public string? Coinsurance { get; set; }
    public string? CoverageType { get; set; }
    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public int? VerifiedByUserId { get; set; }
    public string? VerifiedByUserName { get; set; }
    public string? VerificationNotes { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int InsuranceProviderId { get; set; }
    public string InsuranceProviderName { get; set; } = string.Empty;
}

public class CreatePatientInsuranceDto
{
    [Required]
    [StringLength(100)]
    public string PolicyNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? GroupNumber { get; set; }

    [StringLength(100)]
    public string? SubscriberId { get; set; }

    [StringLength(200)]
    public string? SubscriberName { get; set; }

    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? CopayAmount { get; set; }
    public string? Deductible { get; set; }
    public string? Coinsurance { get; set; }

    [StringLength(50)]
    public string? CoverageType { get; set; }

    [Range(1, int.MaxValue)]
    public int PatientId { get; set; }

    [Range(1, int.MaxValue)]
    public int InsuranceProviderId { get; set; }
}

public class UpdatePatientInsuranceDto
{
    [StringLength(100)]
    public string? PolicyNumber { get; set; }

    [StringLength(100)]
    public string? GroupNumber { get; set; }

    [StringLength(100)]
    public string? SubscriberId { get; set; }

    [StringLength(200)]
    public string? SubscriberName { get; set; }

    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? CopayAmount { get; set; }
    public string? Deductible { get; set; }
    public string? Coinsurance { get; set; }

    [StringLength(50)]
    public string? CoverageType { get; set; }

    public bool? IsActive { get; set; }
}

public class VerifyInsuranceDto
{
    [Range(1, int.MaxValue)]
    public int VerifiedByUserId { get; set; }

    public string? VerificationNotes { get; set; }
}

