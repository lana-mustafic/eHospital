using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IDischargeSummaryService
{
    Task<IEnumerable<DischargeSummaryDto>> GetAllDischargeSummariesAsync();
    Task<DischargeSummaryDto?> GetDischargeSummaryByIdAsync(int id);
    Task<DischargeSummaryDto?> GetDischargeSummaryByDischargeNumberAsync(string dischargeNumber);
    Task<IEnumerable<DischargeSummaryDto>> GetDischargeSummariesByPatientAsync(int patientId);
    Task<IEnumerable<DischargeSummaryDto>> GetDischargeSummariesByDoctorAsync(int doctorId);
    Task<DischargeSummaryDto> CreateDischargeSummaryAsync(CreateDischargeSummaryDto createDischargeSummaryDto);
    Task UpdateDischargeSummaryAsync(int id, UpdateDischargeSummaryDto updateDischargeSummaryDto);
    Task FinalizeDischargeSummaryAsync(int id);
    Task DeleteDischargeSummaryAsync(int id);
    Task<string> GenerateDischargeNumberAsync();
    Task<byte[]> GenerateDischargeSummaryPdfAsync(int id);
}

