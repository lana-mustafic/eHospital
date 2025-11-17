using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IDischargeSummaryRepository : IRepository<DischargeSummary>
{
    Task<DischargeSummary?> GetDischargeSummaryWithDetailsAsync(int id);
    Task<IEnumerable<DischargeSummary>> GetAllDischargeSummariesWithDetailsAsync();
    Task<IEnumerable<DischargeSummary>> GetDischargeSummariesByPatientAsync(int patientId);
    Task<IEnumerable<DischargeSummary>> GetDischargeSummariesByDoctorAsync(int doctorId);
    Task<DischargeSummary?> GetDischargeSummaryByDischargeNumberAsync(string dischargeNumber);
    Task<string> GenerateNextDischargeNumberAsync();
}

