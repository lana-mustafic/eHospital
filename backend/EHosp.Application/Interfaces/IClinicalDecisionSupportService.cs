using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IClinicalDecisionSupportService
{
    Task<CDSDashboardDto> GetDashboardAsync();
    Task<CheckInteractionResponseDto> CheckInteractionsAsync(CheckInteractionRequestDto request);
    Task<IEnumerable<DrugInteractionDto>> GetAllInteractionsAsync();
    Task<IEnumerable<DrugInteractionDto>> GetInteractionsByMedicationAsync(int medicationId);
    Task<IEnumerable<DrugInteractionDto>> GetInteractionsByPatientAsync(int patientId);
    Task<IEnumerable<ClinicalGuidelineDto>> GetGuidelinesAsync(GetGuidelinesRequestDto? request = null);
    Task<ClinicalGuidelineDto?> GetGuidelineByIdAsync(int id);
    Task<IEnumerable<ProtocolSuggestionDto>> GetProtocolSuggestionsAsync(GetProtocolSuggestionsRequestDto request);
    Task<IEnumerable<ProtocolSuggestionDto>> GetAllProtocolsAsync();
    Task<IEnumerable<CriticalValueAlertDto>> GetCriticalAlertsAsync();
    Task<IEnumerable<CriticalValueAlertDto>> GetAlertsByPatientAsync(int patientId);
    Task AcknowledgeAlertAsync(int alertId, string acknowledgedBy);
    Task<IEnumerable<ClinicalGuidelineDto>> GetRemindersAsync(int? patientId = null);
}

