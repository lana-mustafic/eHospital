using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IPriorAuthorizationRepository : IRepository<PriorAuthorization>
{
    Task<PriorAuthorization?> GetPriorAuthorizationWithDetailsAsync(int id);
    Task<IEnumerable<PriorAuthorization>> GetAllPriorAuthorizationsWithDetailsAsync();
    Task<IEnumerable<PriorAuthorization>> GetPriorAuthorizationsByPatientAsync(int patientId);
    Task<IEnumerable<PriorAuthorization>> GetPriorAuthorizationsByStatusAsync(string status);
}

