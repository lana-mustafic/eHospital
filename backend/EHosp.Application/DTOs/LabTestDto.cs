namespace EHosp.Application.DTOs;

public class LabTestDto
{
    public int Id { get; set; }
    public DateTime OrderedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string TestName { get; set; } = string.Empty;
    public string TestType { get; set; } = string.Empty;
    public string? TestCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Results { get; set; }
    public string? Notes { get; set; }
    public string? FilePath { get; set; }
    public string? FileName { get; set; }
    public string? FileContentType { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int DoctorId { get; set; }
    public string? DoctorName { get; set; }
    public int? MedicalRecordId { get; set; }
    public int? PerformedByUserId { get; set; }
    public string? PerformedByName { get; set; }
    
    public bool HasFile => !string.IsNullOrEmpty(FilePath);
}

public class CreateLabTestDto
{
    public DateTime OrderedDate { get; set; } = DateTime.UtcNow;
    public string TestName { get; set; } = string.Empty;
    public string TestType { get; set; } = string.Empty;
    public string? TestCode { get; set; }
    public string Status { get; set; } = "Ordered";
    public string? Notes { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int? MedicalRecordId { get; set; }
}

public class UpdateLabTestDto
{
    public DateTime? CompletedDate { get; set; }
    public string? TestName { get; set; }
    public string? TestType { get; set; }
    public string? TestCode { get; set; }
    public string? Status { get; set; }
    public string? Results { get; set; }
    public string? Notes { get; set; }
    public int? MedicalRecordId { get; set; }
    public int? PerformedByUserId { get; set; }
}

