using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IChronicConditionRepository : IRepository<ChronicCondition>
{
    Task<ChronicCondition?> GetChronicConditionWithDetailsAsync(int id);
    Task<IEnumerable<ChronicCondition>> GetAllChronicConditionsWithDetailsAsync();
    Task<IEnumerable<ChronicCondition>> GetChronicConditionsByPatientAsync(int patientId);
    Task<IEnumerable<ChronicCondition>> GetActiveChronicConditionsByPatientAsync(int patientId);
}

