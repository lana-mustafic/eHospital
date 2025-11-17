namespace EHosp.Application.DTOs;

public class PatientAllergyDto
{
    public int Id { get; set; }
    public string AllergenName { get; set; } = string.Empty;
    public string AllergyType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? Reaction { get; set; }
    public DateTime? OnsetDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int? RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
}

public class CreatePatientAllergyDto
{
    public string AllergenName { get; set; } = string.Empty;
    public string AllergyType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? Reaction { get; set; }
    public DateTime? OnsetDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public int PatientId { get; set; }
    public int? RecordedByUserId { get; set; }
}

public class UpdatePatientAllergyDto
{
    public string? AllergenName { get; set; }
    public string? AllergyType { get; set; }
    public string? Severity { get; set; }
    public string? Reaction { get; set; }
    public DateTime? OnsetDate { get; set; }
    public string? Notes { get; set; }
    public bool? IsActive { get; set; }
}

public class ChronicConditionDto
{
    public int Id { get; set; }
    public string ConditionName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public DateTime? DiagnosisDate { get; set; }
    public string? Status { get; set; }
    public string? Treatment { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int? DiagnosedByDoctorId { get; set; }
    public string? DiagnosedByDoctorName { get; set; }
    public int? RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
}

public class CreateChronicConditionDto
{
    public string ConditionName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public DateTime? DiagnosisDate { get; set; }
    public string? Status { get; set; }
    public string? Treatment { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public int PatientId { get; set; }
    public int? DiagnosedByDoctorId { get; set; }
    public int? RecordedByUserId { get; set; }
}

public class UpdateChronicConditionDto
{
    public string? ConditionName { get; set; }
    public string? Category { get; set; }
    public DateTime? DiagnosisDate { get; set; }
    public string? Status { get; set; }
    public string? Treatment { get; set; }
    public string? Notes { get; set; }
    public bool? IsActive { get; set; }
    public int? DiagnosedByDoctorId { get; set; }
}

public class FamilyMedicalHistoryDto
{
    public int Id { get; set; }
    public string Relationship { get; set; } = string.Empty;
    public string ConditionName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? AgeOfOnset { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int? RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
}

public class CreateFamilyMedicalHistoryDto
{
    public string Relationship { get; set; } = string.Empty;
    public string ConditionName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? AgeOfOnset { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public int PatientId { get; set; }
    public int? RecordedByUserId { get; set; }
}

public class UpdateFamilyMedicalHistoryDto
{
    public string? Relationship { get; set; }
    public string? ConditionName { get; set; }
    public string? Category { get; set; }
    public string? AgeOfOnset { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
}

