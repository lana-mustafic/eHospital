using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IEDVisitRepository
{
    Task<EDVisit?> GetByIdAsync(int id);
    Task<IEnumerable<EDVisit>> GetAllAsync();
    Task<IEnumerable<EDVisit>> GetActiveVisitsAsync();
    Task<IEnumerable<EDVisit>> GetByPatientAsync(int patientId);
    Task<IEnumerable<EDVisit>> GetByStatusAsync(string status);
    Task<IEnumerable<EDVisit>> GetByTriagePriorityAsync(string priority);
    Task<IEnumerable<EDVisit>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<EDVisit>> GetByDoctorAsync(int doctorId);
    Task<EDVisit> AddAsync(EDVisit edVisit);
    Task UpdateAsync(EDVisit edVisit);
    Task DeleteAsync(EDVisit edVisit);
    Task<int> GetActiveVisitCountAsync();
    Task<int> GetVisitCountByPriorityAsync(string priority);
}

