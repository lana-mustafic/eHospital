using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IEDVisitService
{
    Task<IEnumerable<EDVisitDto>> GetAllVisitsAsync();
    Task<EDVisitDto?> GetVisitByIdAsync(int id);
    Task<IEnumerable<EDVisitDto>> GetActiveVisitsAsync();
    Task<IEnumerable<EDVisitDto>> GetByPatientAsync(int patientId);
    Task<IEnumerable<EDVisitDto>> GetByStatusAsync(string status);
    Task<IEnumerable<EDVisitDto>> GetByTriagePriorityAsync(string priority);
    Task<IEnumerable<EDVisitDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<EDVisitDto> CreateVisitAsync(CreateEDVisitDto createDto);
    Task<EDVisitDto> UpdateVisitAsync(int id, UpdateEDVisitDto updateDto);
    Task<EDVisitDto> PerformTriageAsync(int id, TriageDto triageDto);
    Task<EDVisitDto> StartTreatmentAsync(int id, int doctorId);
    Task<EDVisitDto> DischargePatientAsync(int id, string disposition, string? notes);
    Task DeleteVisitAsync(int id);
    Task<Dictionary<string, int>> GetEDStatisticsAsync();
}

