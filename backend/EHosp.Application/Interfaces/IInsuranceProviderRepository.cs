using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IInsuranceProviderRepository : IRepository<InsuranceProvider>
{
    Task<IEnumerable<InsuranceProvider>> GetActiveProvidersAsync();
    Task<InsuranceProvider?> GetProviderByCodeAsync(string code);
}

