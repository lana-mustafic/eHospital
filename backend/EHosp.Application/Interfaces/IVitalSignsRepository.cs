using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IVitalSignsRepository : IRepository<VitalSigns>
{
    Task<VitalSigns?> GetVitalSignsWithDetailsAsync(int id);
    Task<IEnumerable<VitalSigns>> GetVitalSignsByPatientAsync(int patientId);
    Task<IEnumerable<VitalSigns>> GetAllVitalSignsWithDetailsAsync();
    Task<IEnumerable<VitalSigns>> GetVitalSignsByPatientAndDateRangeAsync(int patientId, DateTime startDate, DateTime endDate);
}

