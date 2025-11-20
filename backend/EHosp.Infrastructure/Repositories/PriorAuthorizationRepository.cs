using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class PriorAuthorizationRepository : BaseRepository<PriorAuthorization>, IPriorAuthorizationRepository
{
    public PriorAuthorizationRepository(ApplicationDbContext context) : base(context) { }

    public async Task<PriorAuthorization?> GetPriorAuthorizationWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.Patient)
            .ThenInclude(p => p.User)
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Include(pa => pa.RelatedInvoice)
            .Include(pa => pa.RelatedAppointment)
            .Include(pa => pa.RequestedByUser)
            .FirstOrDefaultAsync(pa => pa.Id == id);
    }

    public async Task<IEnumerable<PriorAuthorization>> GetAllPriorAuthorizationsWithDetailsAsync()
    {
        return await _dbSet
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.Patient)
            .ThenInclude(p => p.User)
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Include(pa => pa.RequestedByUser)
            .OrderByDescending(pa => pa.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PriorAuthorization>> GetPriorAuthorizationsByPatientAsync(int patientId)
    {
        return await _dbSet
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Where(pa => pa.PatientInsurance.PatientId == patientId)
            .OrderByDescending(pa => pa.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PriorAuthorization>> GetPriorAuthorizationsByStatusAsync(string status)
    {
        return await _dbSet
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.Patient)
            .ThenInclude(p => p.User)
            .Include(pa => pa.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Where(pa => pa.Status == status)
            .OrderByDescending(pa => pa.CreatedAt)
            .ToListAsync();
    }
}

