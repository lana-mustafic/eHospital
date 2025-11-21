using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class ClinicalGuidelineDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Recommendations { get; set; } = new();
    public string EvidenceLevel { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
    public List<string>? ApplicableTo { get; set; }
}

public class ProtocolSuggestionDto
{
    public int Id { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string ProtocolName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ProtocolStepDto> Steps { get; set; } = new();
    public List<string> Indications { get; set; } = new();
    public List<string> Contraindications { get; set; } = new();
    public string Priority { get; set; } = string.Empty;
}

public class ProtocolStepDto
{
    public int StepNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public string? Notes { get; set; }
}

public class CriticalValueAlertDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string TestName { get; set; } = string.Empty;
    public string TestType { get; set; } = string.Empty;
    public string Parameter { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string NormalRange { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string AlertMessage { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool Acknowledged { get; set; }
    public string? AcknowledgedBy { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
}

public class CDSDashboardDto
{
    public int ActiveInteractions { get; set; }
    public int PendingAlerts { get; set; }
    public int GuidelinesAvailable { get; set; }
    public int ProtocolsSuggested { get; set; }
    public List<CriticalValueAlertDto> RecentAlerts { get; set; } = new();
    public List<DrugInteractionDto> RecentInteractions { get; set; } = new();
}

public class CheckInteractionRequestDto
{
    [Required]
    public List<int> MedicationIds { get; set; } = new();
    public int? PatientId { get; set; }
}

public class CheckInteractionResponseDto
{
    public bool HasInteractions { get; set; }
    public List<DrugInteractionDto> Interactions { get; set; } = new();
    public string? AlertMessage { get; set; }
}

public class GetGuidelinesRequestDto
{
    public string? Condition { get; set; }
    public string? Category { get; set; }
    public int? PatientId { get; set; }
}

public class GetProtocolSuggestionsRequestDto
{
    [Required]
    public string Condition { get; set; } = string.Empty;
    public int? PatientId { get; set; }
    public List<string>? Symptoms { get; set; }
}

public class AcknowledgeAlertRequestDto
{
    [Required]
    public string AcknowledgedBy { get; set; } = string.Empty;
}

