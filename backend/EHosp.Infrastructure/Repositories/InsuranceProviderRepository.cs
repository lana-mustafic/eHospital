using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class InsuranceProviderRepository : BaseRepository<InsuranceProvider>, IInsuranceProviderRepository
{
    public InsuranceProviderRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<InsuranceProvider>> GetActiveProvidersAsync()
    {
        return await _dbSet
            .Where(ip => ip.IsActive)
            .OrderBy(ip => ip.Name)
            .ToListAsync();
    }

    public async Task<InsuranceProvider?> GetProviderByCodeAsync(string code)
    {
        return await _dbSet
            .FirstOrDefaultAsync(ip => ip.Code != null && ip.Code.ToLower() == code.ToLower());
    }
}

